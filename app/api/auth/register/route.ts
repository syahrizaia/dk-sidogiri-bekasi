import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { 
      success: false, 
      error: "Pendaftaran akun publik telah dinonaktifkan. Seluruh akun pengguna dibuatkan dan dikelola langsung oleh Super Admin." 
    },
    { status: 403 }
  );
}
