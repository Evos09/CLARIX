import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) {
    return noContext();
  }

  const org = await prisma.organization.findUnique({
    where: { id: ctx.orgId },
    select: { customVocabulary: true },
  });

  return NextResponse.json({
    customVocabulary: org?.customVocabulary ?? [],
  });
}

export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) {
    return noContext();
  }

  const body = await req.json().catch(() => null);
  const { customVocabulary } = body || {};

  if (!Array.isArray(customVocabulary)) {
    return NextResponse.json({ error: "customVocabulary must be an array of strings" }, { status: 400 });
  }

  // Clean strings (trim, remove empty strings, keep alphanumeric/spaces)
  const cleanedVocabulary = customVocabulary
    .map((word: any) => String(word).trim())
    .filter((word) => word.length > 0);

  const updatedOrg = await prisma.organization.update({
    where: { id: ctx.orgId },
    data: {
      customVocabulary: cleanedVocabulary,
    },
    select: { customVocabulary: true },
  });

  return NextResponse.json({
    success: true,
    customVocabulary: updatedOrg.customVocabulary,
  });
}
