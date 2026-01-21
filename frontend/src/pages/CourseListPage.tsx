/*
Purpose

Show all courses under a category

This matches the “All courses / Web Design / Product Design” screenshot

Used by

Students (browse & enroll)

Admins (see what exists, click “edit”)

UI elements

Category breadcrumb

Grid/list of course cards

Each card shows:

title

short description

level

total lectures

CTA: “View course”
*/
// import React from 'react'
import { getCoursesByCategory } from '../services/course.service'
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { Link, useParams } from "react-router"
import type { CourseLevel, Course } from '../types/course';
import CourseCard from '../components/CourseCard';



export default function CourseListPage() {
    const { categoryId } = useParams<{ categoryId: string }>();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("categoryId:", categoryId)
        if (!categoryId) return;


        const fetchCourses = async () => {
            try {
                const data = await getCoursesByCategory(categoryId);
                setCourses(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load courses");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [categoryId]);

    // show categories bar
    // show courses (use course card, put all courses here [maybe pagination later])

    // ADMIN-only
    //course card have Edit, Update, Delete
    // after all courses cards, a placeholder for Admin to create a new course (虚线， 中间加号)

    // create course/lecture/upload file 可以用同一个modal?
    if (loading) {
        return (
            <div>
                <NavBar />
                <div className="p-8">Loading courses...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <NavBar />
                <div className="p-8 text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div>
            <div>
                <NavBar />
                {/* Headings */}
                <section className="px-8 py-6">
                    <h2 className="text-3xl font-bold mb-2">
                        Skills to transform your career and life
                    </h2>
                    <p className="text-gray-600">
                        From critical skills to technical topics, Pilot Academy supports your
                        professional development.
                    </p>
                </section>

                {/* Course Grids */}
                <section className="px-8 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.courseId}
                                course={course}
                            />
                        ))}
                    </div>

                    {courses.length === 0 && (
                        <div className="text-gray-500 mt-6">
                            No courses found in this category.
                        </div>
                    )}
                </section>

            </div>

        </div>
    )
}
