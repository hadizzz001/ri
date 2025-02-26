export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");
  
    // Simulated database lookup for available dates per location
    const appointmentSlots = {
      "1": ["2024-03-01", "2024-03-05", "2024-03-10"],
      "2": ["2024-03-02", "2024-03-06", "2024-03-12"],
    };
  
    return Response.json(appointmentSlots[location] || []);
  }
  