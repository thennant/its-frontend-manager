import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

/**
 * @swagger
 * /api/course-management/create-course:
 *   post:
 *     description: |
 *       # Course creation
 *       Creates a course with input details. The course is created as part of the creator's school.
 *       
 *       **Request format**  
 *       user_id: string  
 *       user_role: Role  
 *       school_id: string  
 *       code: string  
 *       name: string  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "userID13z814m"
 *               user_role:
 *                 type: Role
 *                 example: "TEACHER"
 *               school_id:
 *                 type: string
 *                 example: "inst_001"
 *               code:
 *                 type: string
 *                 example: "CS3213"
 *               name:
 *                 type: string
 *                 example: "Foundations of Software Engineering"
 *     responses:
 *       200:
 *         description: Successfully created course
 *         content:
 *           application/json:
 *             example:
 *               courseToCreate:
 *                 id: "inst001_CS3213"
 *                 code: "CS3213"
 *                 name: "Foundations of Software Engineering"
 *                 creator_id: "userID13z814m"
 *                 school_id: "inst001"
 *       403:
 *         description: Permission denied
 *         content:
 *           application/json:
 *             example:
 *               error: "You do not have the permission to make this request."
 *       409:
 *         description: Course already exists
 *         content:
 *           application/json:
 *             example:
 *               error: "Course already exists."
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             example:
 *               error: "Unexpected error occurred."
 */

export async function POST(req: Request) {
  try {
    const { user_id, user_role, school_id, code, name } =
      (await req.json()) as {
        user_id: string;
        user_role: Role;
        school_id: string;
        code: string;
        name: string;
      };

    if (user_role !== Role.TEACHER) {
      return NextResponse.json({
        error: 'You do not have the permission to make this request.'
      }, {
        status: 403
      });
    }

    const courseId = school_id + "_" + code;

    const duplicateCourse = await prisma.course.findUnique({
        where: {
            id: courseId,
        }
    })

    if (duplicateCourse !== null) {
      return NextResponse.json({
        error: 'Course already exists.'
      }, {
        status: 409
      });
    }

    const courseToCreate = await prisma.course.create({
      data: {
        id: school_id + "_" + code,
        code: code,
        name: name,
        creator_id: user_id,
        school_id: school_id,
      },
    });

    return NextResponse.json({
      courseToCreate
    }, {
      status: 200
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, {
      status: 500
    });
  }
}
