type QuestionResult = {
  questionId: string;
  prompt: string;
  options: string[];
  yourAnswer?: string;
  correctAnswer: string;
  explanation?: string;
  isCorrect: boolean;
};

export function QuestionResultCard({ q }: { q: QuestionResult }) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body gap-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-base">{q.prompt}</h3>
          <span
            className={`badge ${q.isCorrect ? "badge-success" : "badge-error"}`}
          >
            {q.isCorrect ? "Correct" : "Wrong"}
          </span>
        </div>

        <div className="space-y-2">
          {q.options.map((opt) => {
            const isCorrect = opt === q.correctAnswer;
            const isUser = opt === q.yourAnswer;
            const wrongSelected = isUser && !isCorrect;

            return (
              <div
                key={opt}
                className={`p-3 rounded-lg border flex justify-between items-center
                    ${
                      isCorrect
                        ? "border-success bg-success/10"
                        : wrongSelected
                        ? "border-error bg-error/10"
                        : "border-base-300"
                    }`}
              >
                <span>{opt}</span>
                {isCorrect && <span className="text-success text-sm">✔</span>}
                {wrongSelected && (
                  <span className="text-error text-sm">Your Answer</span>
                )}
              </div>
            );
          })}
        </div>

        {q.explanation && (
          <div
            className={`card ${
              q.isCorrect
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="card-body">
              <h3 className="font-semibold text-lg">
                {q.isCorrect ? "Why this is correct" : "Why this is incorrect"}
              </h3>

              <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
