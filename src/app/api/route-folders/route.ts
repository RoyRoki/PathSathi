import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const routesDir = path.join(process.cwd(), "public/routes");

        // Check if directory exists
        if (!fs.existsSync(routesDir)) {
            return NextResponse.json({ folders: [] });
        }

        const folders = fs.readdirSync(routesDir).filter((file) => {
            return fs.statSync(path.join(routesDir, file)).isDirectory();
        });

        return NextResponse.json({ folders });
    } catch (error) {
        console.error("Error reading route folders:", error);
        return NextResponse.json({ error: "Failed to list folders" }, { status: 500 });
    }
}
