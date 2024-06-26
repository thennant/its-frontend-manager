import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {sendPasswordResetEmail} from '@/lib/send-reset-email';
import { createPasswordResetToken } from '@/lib/tokens';

/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     description: |
 *       # Request for a password reset
 *       Initiates a request to reset the password of the user associated with the input email.
 *       
 *       **Request format**  
 *       email: string  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "student1@test.com"
 *     responses:
 *       200:
 *         description: Successfully initiated password reset process for given email
 *         content:
 *           application/json:
 *             example:
 *               reset: 
 *                 email: "student1@test.com"
 *       404:
 *         description: Target user not found
 *         content:
 *           application/json:
 *             example:
 *               error: "User not found."
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             example:
 *               error: "Unexpected error occurred."
 */

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as {
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: {
          email: email.toLowerCase()
      }
    })

    if (!user) {
      return NextResponse.json({
        error: `User not found.`
      }, {
        status: 404
      });
    } else {
      // user exists
      const passwordResetToken = await createPasswordResetToken(user.email)
      const result = await sendPasswordResetEmail(user.email, passwordResetToken.token)
      return NextResponse.json({
        reset: {
          email: user.email,
        }
      }, {
        status: 200
      });
    }

  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, {
      status: 500
    });
  }
}
