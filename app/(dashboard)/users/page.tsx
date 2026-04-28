import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminUser } from "@/lib/actions";
import { DeleteUserButton } from "./DeleteUserButton";

export default async function UsersPage() {
  const [users, session] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "asc" } }),
    auth(),
  ]);

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <h1 className="text-2xl font-bold">Admin Users</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Add User</CardTitle></CardHeader>
          <CardContent>
            <form action={createAdminUser} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required placeholder="e.g. John Smith" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" required placeholder="john@company.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" name="password" type="password" required placeholder="min. 8 characters" minLength={8} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select name="role" defaultValue="ADMIN">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin (full access)</SelectItem>
                    <SelectItem value="VIEWER">Viewer (read only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Add User</Button>
            </form>
          </CardContent>
        </Card>

        <div className="rounded-lg border overflow-hidden overflow-x-auto h-fit">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium flex items-center gap-2">
                      {u.name}
                      {u.id === session?.user?.id && (
                        <span className="text-xs text-muted-foreground">(you)</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== session?.user?.id && (
                      <div className="flex justify-end">
                        <DeleteUserButton id={u.id} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
