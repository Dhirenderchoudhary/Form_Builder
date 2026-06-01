const secretKey = process.env.CLERK_SECRET_KEY;

if (!secretKey) {
  console.error("Missing CLERK_SECRET_KEY");
  process.exit(1);
}

async function seed() {
  try {
    const res = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: ["demo@konoha.com"],
        password: "Konoha!Demo2024$",
        first_name: "Demo",
        last_name: "User",
        skip_password_checks: true,
        skip_password_requirement: true,
        bypass_client_trust: true,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log("Successfully created demo user in Clerk:", data.id);
    } else {
      if (data.errors && data.errors.some((e: any) => e.code === "form_identifier_exists")) {
        console.log("User demo@konoha.com already exists in Clerk.");
        
        // Find user ID
        const getRes = await fetch("https://api.clerk.com/v1/users?email_address=demo@konoha.com", {
          headers: { "Authorization": `Bearer ${secretKey}` }
        });
        const users = await getRes.json();
        if (users.length > 0) {
          const userId = users[0].id;
          
          // Update password
          const patchRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${secretKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              password: "Konoha!Demo2024$",
              skip_password_checks: true,
            })
          });
          
          if (patchRes.ok) {
            console.log("Updated password for existing demo user.");
          } else {
            console.error("Failed to update password:", await patchRes.json());
          }
        }
      } else {
        console.error("Failed to create user:", JSON.stringify(data, null, 2));
      }
    }
  } catch (err) {
    console.error("Network error:", err);
  }
}

seed();
