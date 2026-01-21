type Question = {
  questionId: string;
  prompt: string;
  options: string[];
};

type Props = {
  question: Question;
  index: number;
  total: number;
  selected?: string;
  onSelect: (option: string) => void;
};

export default function QuestionCard({
  question,
  index,
  total,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        {/* Title */}
        <h2 className="card-title">
          Question {index + 1} of {total}
        </h2>

        {/* Prompt */}
        <p className="mb-4 text-base leading-relaxed">{question.prompt}</p>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((opt) => {
            const checked = selected === opt;

            return (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition
                  ${
                    checked
                      ? "border-primary bg-primary/5"
                      : "hover:bg-base-200"
                  }
                `}
              >
                <input
                  type="radio"
                  name={question.questionId}
                  className="radio radio-primary"
                  checked={checked}
                  onChange={() => onSelect(opt)}
                />
                <span className="text-sm">{opt}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
