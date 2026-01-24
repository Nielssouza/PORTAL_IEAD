export async function GET() {
  return Response.json({
    message: "API example",
    data: {
      version: "v1",
    },
  });
}
