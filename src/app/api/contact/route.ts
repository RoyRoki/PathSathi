import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, message } = body;

        if (!message || message.length < 15) {
            return NextResponse.json(
                { error: 'Message must be at least 15 characters long.' },
                { status: 400 }
            );
        }

        // Simulate email sending
        console.log('--- Email Simulation ---');
        console.log('To: rokiroy2207@gmail.com');
        console.log('From: PathSathi Contact Form');
        console.log('Name:', name || 'Anonymous');
        console.log('Message:', message);
        console.log('------------------------');

        // In a real application, you would use a service like Resend, SendGrid, or nodemailer here.
        // await resend.emails.send({ ... });

        return NextResponse.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error processing contact request:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
