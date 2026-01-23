import * as homeworkRepository from "../repositories/homeworkRepository.js";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../config/dynamodb.js";
import { getLecturesByCourseId } from "./course.service.js";

const COURSE_TABLE = process.env.DYNANODB_COURSE_TABLE_NAME || "Courses";

export const getAllHomeworks = async (filters) => {
  let result = await homeworkRepository.findAll();

  if (filters.tutorId) {
    result = result.filter((hw) => hw.tutorId === filters.tutorId);
  }

  if (filters.courseId) {
    result = result.filter((hw) => hw.courseId === filters.courseId);
  }

  return { data: result, count: result.length };
};

export const getHomeworkById = async (id) => {
  const homework = await homeworkRepository.findById(id);
  if (!homework) {
    return { error: "Homework not found", status: 404 };
  }
  return { data: homework };
};

export const createHomework = async (homeworkData) => {
  const { tutorId, courseId, title, description, dueDate } = homeworkData;

  if (!tutorId || !courseId || !title) {
    return {
      error:
        "Missing required fields: tutorId, courseId, and title are required",
      status: 400,
    };
  }

  const newHomework = await homeworkRepository.create({
    tutorId,
    courseId,
    title,
    description: description || "",
    dueDate: dueDate || null,
  });

  return { data: newHomework, status: 201 };
};

export const updateHomework = async (id, updateData) => {
  const { tutorId, title, description, dueDate } = updateData;

  if (!tutorId) {
    return { error: "tutorId is required", status: 400 };
  }

  const existingHomework = await homeworkRepository.findById(id);
  if (!existingHomework) {
    return { error: "Homework not found", status: 404 };
  }

  // if (tutorId !== existingHomework.tutorId) {
  //   return { error: "tutorId does not match", status: 400 };
  // }

  const updatedHomework = await homeworkRepository.update(id, {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(dueDate !== undefined && { dueDate }),
  });

  return { data: updatedHomework };
};

export const deleteHomework = async (id, tutorId) => {
  if (!tutorId) {
    return { error: "tutorId is required", status: 400 };
  }

  const homework = await homeworkRepository.findById(id);
  if (!homework) {
    return { error: "Homework not found", status: 404 };
  }

  if (tutorId !== homework.tutorId) {
    return { error: "tutorId does not match", status: 400 };
  }

  await homeworkRepository.remove(id);

  return { status: 204 };
};

export const addSubmissionToHomework = async (homeworkId, submissionId) => {
  const homework = await homeworkRepository.findById(homeworkId);
  if (homework) {
    const submissions = homework.submissions || [];
    submissions.push(submissionId);
    await homeworkRepository.update(homeworkId, { submissions });
  }
};

export const removeSubmissionFromHomework = async (
  homeworkId,
  submissionId,
) => {
  const homework = await homeworkRepository.findById(homeworkId);
  if (homework) {
    const submissions = (homework.submissions || []).filter(
      (subId) => subId !== submissionId,
    );
    await homeworkRepository.update(homeworkId, { submissions });
  }
};

export const getHomeworksByStudentId = async (
  studentId,
  notOverdue = false,
) => {
  // Find all courses where studentId is in studentIds array
  const coursesResult = await ddb.send(
    new ScanCommand({
      TableName: COURSE_TABLE,
      FilterExpression: "entityType = :course AND contains(studentIds, :sid)",
      ExpressionAttributeValues: {
        ":course": "COURSE",
        ":sid": studentId,
      },
    }),
  );

  const courses = coursesResult.Items || [];

  const allHomeworks = await homeworkRepository.findAll();

  // check if homework is overdue
  const isOverdue = (homework) => {
    if (!homework.dueDate) return false;
    const dueDate = new Date(homework.dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < now;
  };

  const result = await Promise.all(
    courses.map(async (course) => {
      const lectures = await getLecturesByCourseId(course.courseId);
      const lectureIds = lectures.map((lecture) => lecture.lectureId);

      let courseHomeworks = allHomeworks.filter((hw) =>
        lectureIds.includes(hw.courseId),
      );

      // filter out overdue homeworks if notOverdue is true
      if (notOverdue) {
        courseHomeworks = courseHomeworks.filter((hw) => !isOverdue(hw));
      }

      return {
        course: {
          courseId: course.courseId,
          courseName: course.courseName,
          description: course.description,
          categoryName: course.categoryName,
          level: course.level,
          instructor: course.instructor,
        },
        homeworks: courseHomeworks,
      };
    }),
  );

  return { data: result, count: result.length };
};
