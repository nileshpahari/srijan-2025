import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (id) {
      const user = await User.findById(id).select("-password");
      if (!user)
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      console.log(user);
      return NextResponse.json(user);
    }

    // If no ID, perform search query
    const query = searchParams.get("query") || "";
    const user = await getUserFromToken(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const users = await User.find({
      $and: [
        { email: { $ne: user.email } }, // Exclude current user
        {
          $or: [
            { fullName: { $regex: query, $options: "i" } },
            {
              skills: {
                $elemMatch: { skillName: { $regex: query, $options: "i" } },
              },
            },
            { branch: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .select("-password")
      .limit(20);

    return NextResponse.json(users);
  } catch (error) {
    console.log("NOOOOOOOOOOOOOOOOOOOOOOOOOB");
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await getUserFromToken(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { skillName, skillLevel } = await request.json();
    if (!skillName || !skillLevel) {
      return NextResponse.json(
        { error: "Missing skill data" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: { "skills.$[elem].skillLevel": skillLevel },
      },
      {
        arrayFilters: [{ "elem.skillName": skillName }],
        new: true,
      }
    ).select("-password");

    if (!updatedUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
