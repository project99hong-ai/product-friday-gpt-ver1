import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "friday_visionboard_v1";
const nameRule = /^[\uAC00-\uD7A3]+[A-Za-z]?$/;

const emptyForm = {
  title: "",
  content: "",
  startDate: "",
  endDate: "",
  progress: 0,
  completed: false,
  imageDataUrl: "",
};

const sortOptions = [
  { value: "deadline", label: "종료일 임박순" },
  { value: "progress", label: "달성률 높은순" },
];

const filterOptions = [
  { value: "all", label: "전체" },
  { value: "ongoing", label: "진행중" },
  { value: "completed", label: "완료" },
];

const toMidnight = (value) => {
  if (!value) return null;
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDdayLabel = (endDate) => {
  const end = toMidnight(endDate);
  if (!end) return "기간 미설정";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "D-day";
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
};

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to read visionboard storage", error);
    return null;
  }
};

export const tap = {
  id: "visionboard",
  label: "비전보드",
  title: "비전보드",
  description: "목표를 카드로 정리하고 달성률을 관리하는 공간입니다.",
  Component: function VisionBoard() {
    const [studentName, setStudentName] = useState("");
    const [nameError, setNameError] = useState("");
    const [goals, setGoals] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState("");
    const [sortBy, setSortBy] = useState("deadline");
    const [filterBy, setFilterBy] = useState("all");
    const [modalImage, setModalImage] = useState("");

    // LocalStorage에서 초기 데이터 복원
    useEffect(() => {
      const stored = readStorage();
      if (!stored) return;
      setStudentName(stored.studentName ?? "");
      setGoals(Array.isArray(stored.goals) ? stored.goals : []);
    }, []);

    // 변경 사항을 LocalStorage에 저장
    useEffect(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ studentName, goals })
      );
    }, [studentName, goals]);

    const filteredGoals = useMemo(() => {
      // 필터/정렬 처리
      const filtered = goals.filter((goal) => {
        if (filterBy === "completed") return goal.completed;
        if (filterBy === "ongoing") return !goal.completed;
        return true;
      });

      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "progress") {
          if (b.progress !== a.progress) return b.progress - a.progress;
        }
        const endA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        const endB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
        if (endA !== endB) return endA - endB;
        return b.createdAt - a.createdAt;
      });

      return sorted;
    }, [goals, filterBy, sortBy]);

    const handleNameChange = (event) => {
      const value = event.target.value.trim();
      setStudentName(value);
      if (!value) {
        setNameError("");
        return;
      }
      setNameError(
        nameRule.test(value)
          ? ""
          : "이름은 한글 필수, 마지막에 영문 1글자만 허용됩니다."
      );
    };

    const handleFieldChange = (field) => (event) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleProgressChange = (event) => {
      const value = Number(event.target.value);
      setForm((prev) => ({
        ...prev,
        progress: value,
        completed: value < 100 ? false : prev.completed,
      }));
    };

    const handleCompletedChange = (event) => {
      const checked = event.target.checked;
      setForm((prev) => ({
        ...prev,
        completed: checked,
        progress: checked ? 100 : prev.progress,
      }));
    };

    // 이미지 파일을 DataURL로 변환
    const handleImageChange = (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        setForm((prev) => ({ ...prev, imageDataUrl: "" }));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({
          ...prev,
          imageDataUrl: typeof reader.result === "string" ? reader.result : "",
        }));
      };
      reader.readAsDataURL(file);
    };

    const resetForm = () => {
      setForm(emptyForm);
      setEditingId(null);
      setFormError("");
    };

    // 목표 추가/수정 저장
    const handleSubmit = (event) => {
      event.preventDefault();
      if (!form.title.trim()) {
        setFormError("목표 제목은 필수입니다.");
        return;
      }
      if (form.startDate && form.endDate && form.endDate < form.startDate) {
        setFormError("종료일은 시작일 이후여야 합니다.");
        return;
      }

      const payload = {
        ...form,
        title: form.title.trim(),
        content: form.content.trim(),
        progress: form.completed ? 100 : Number(form.progress),
      };

      if (editingId) {
        setGoals((prev) =>
          prev.map((goal) =>
            goal.id === editingId ? { ...goal, ...payload } : goal
          )
        );
      } else {
        const newGoal = {
          ...payload,
          id: `goal-${Date.now()}`,
          createdAt: Date.now(),
        };
        setGoals((prev) => [newGoal, ...prev]);
      }

      resetForm();
    };

    const handleEdit = (goal) => {
      setEditingId(goal.id);
      setForm({
        title: goal.title,
        content: goal.content ?? "",
        startDate: goal.startDate ?? "",
        endDate: goal.endDate ?? "",
        progress: goal.progress ?? 0,
        completed: goal.completed ?? false,
        imageDataUrl: goal.imageDataUrl ?? "",
      });
      setFormError("");
    };

    const handleDelete = (goalId) => {
      if (!window.confirm("이 목표를 삭제할까요?")) return;
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    };

    const handleCardComplete = (goalId, completed) => {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? { ...goal, completed, progress: completed ? 100 : goal.progress }
            : goal
        )
      );
    };

    return (
      <div className="visionboard">
        <section className="visionboard-panel">
          <div>
            <p className="tap-meta">VISION BOARD</p>
            <h3 className="visionboard-title">나의 목표를 그리는 비전보드</h3>
            <p className="tap-text">
              목표를 카드로 정리하고 진행 상황을 한눈에 확인하세요.
            </p>
          </div>
          <div className="field">
            <label htmlFor="student-name">학생 이름</label>
            <input
              id="student-name"
              type="text"
              placeholder="예: 김땡땡A"
              value={studentName}
              onChange={handleNameChange}
              aria-invalid={Boolean(nameError)}
            />
            {nameError && <p className="form-error">{nameError}</p>}
          </div>
        </section>

        <section className="visionboard-panel">
          <h3 className="visionboard-subtitle">
            {editingId ? "목표 수정" : "새 목표 추가"}
          </h3>
          <form className="visionboard-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="goal-title">목표 제목 (필수)</label>
              <input
                id="goal-title"
                type="text"
                value={form.title}
                onChange={handleFieldChange("title")}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="goal-content">목표 내용 (선택)</label>
              <textarea
                id="goal-content"
                rows="3"
                value={form.content}
                onChange={handleFieldChange("content")}
              />
            </div>

            <div className="visionboard-row">
              <div className="field">
                <label htmlFor="goal-start">시작일</label>
                <input
                  id="goal-start"
                  type="date"
                  value={form.startDate}
                  onChange={handleFieldChange("startDate")}
                />
              </div>
              <div className="field">
                <label htmlFor="goal-end">종료일</label>
                <input
                  id="goal-end"
                  type="date"
                  value={form.endDate}
                  onChange={handleFieldChange("endDate")}
                />
              </div>
            </div>

            <div className="visionboard-row">
              <div className="field">
                <label htmlFor="goal-progress">달성률</label>
                <div className="visionboard-progress-input">
                  <input
                    id="goal-progress"
                    type="range"
                    min="0"
                    max="100"
                    value={form.progress}
                    onChange={handleProgressChange}
                  />
                  <span>{form.progress}%</span>
                </div>
              </div>
              <label className="visionboard-check">
                <input
                  type="checkbox"
                  checked={form.completed}
                  onChange={handleCompletedChange}
                />
                완료 체크
              </label>
            </div>

            <div className="field">
              <label htmlFor="goal-image">이미지 업로드 (선택)</label>
              <input
                id="goal-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            {form.imageDataUrl && (
              <button
                type="button"
                className="visionboard-image-preview"
                onClick={() => setModalImage(form.imageDataUrl)}
              >
                <img src={form.imageDataUrl} alt="미리보기" />
                <span>이미지 미리보기</span>
              </button>
            )}

            {formError && <p className="form-error">{formError}</p>}

            <div className="visionboard-actions">
              <button type="submit">
                {editingId ? "목표 저장" : "목표 추가"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm}>
                  취소
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="visionboard-panel">
          <div className="visionboard-controls">
            <div className="visionboard-filter">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={filterBy === option.value ? "is-active" : ""}
                  onClick={() => setFilterBy(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="visionboard-sort">
              <label htmlFor="vision-sort">정렬</label>
              <select
                id="vision-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="visionboard-grid">
            {filteredGoals.length === 0 && (
              <p className="visionboard-empty">
                아직 등록된 목표가 없습니다. 첫 목표를 추가해보세요.
              </p>
            )}

            {filteredGoals.map((goal) => (
              <article key={goal.id} className="visionboard-card">
                <header className="visionboard-card-head">
                  <h4>{goal.title}</h4>
                  <label className="visionboard-card-check">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={(event) =>
                        handleCardComplete(goal.id, event.target.checked)
                      }
                    />
                    완료
                  </label>
                </header>

                {goal.content && <p>{goal.content}</p>}

                <div className="visionboard-card-meta">
                  <span>{getDdayLabel(goal.endDate)}</span>
                  {goal.startDate && goal.endDate && (
                    <span>
                      {goal.startDate} ~ {goal.endDate}
                    </span>
                  )}
                </div>

                <div className="visionboard-progress">
                  <div className="visionboard-progress-bar">
                    <span style={{ width: `${goal.progress}%` }} />
                  </div>
                  <strong>{goal.progress}%</strong>
                </div>

                {goal.imageDataUrl && (
                  <button
                    type="button"
                    className="visionboard-thumb"
                    onClick={() => setModalImage(goal.imageDataUrl)}
                  >
                    <img src={goal.imageDataUrl} alt="목표 이미지" />
                  </button>
                )}

                <div className="visionboard-card-actions">
                  <button type="button" onClick={() => handleEdit(goal)}>
                    수정
                  </button>
                  <button type="button" onClick={() => handleDelete(goal.id)}>
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {modalImage && (
          <div className="visionboard-modal" role="dialog">
            <div className="visionboard-modal-card">
              <img src={modalImage} alt="선택한 이미지" />
              <button
                type="button"
                onClick={() => setModalImage("")}
                className="visionboard-close"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
};
