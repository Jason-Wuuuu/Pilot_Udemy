const homeworkSchema = {
  id: Number,
  tutorId: String,
  courseId: String,
  title: String,
  description: String,
  dueDate: String,
  submissions: [String], // submissionIds
  createdAt: Date,
  updatedAt: Date,
};

const submissionSchema = {
  id: String,
  studentId: String,
  homeworkId: String,
  text: String,
  fileUrl: String,
  score: Number,
  feedback: String,
  submittedAt: Date,
};
