import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UserEmail {
  _id: string;
  email: string;
  provider: "gmail" | "outlook" | "custom";
  name?: string;
  isPrimary: boolean;
  connectedAt: string;
  createdAt: string;
  updatedAt: string;
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
  };
  imap?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
  };
}

interface EmailTableProps {
  emails: UserEmail[];
  onSetPrimary: (emailId: string) => void;
  onDeleteEmail: (emailId: string) => void;
}

export const EmailTable: React.FC<EmailTableProps> = ({ emails, onSetPrimary, onDeleteEmail }) => {
  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="flex-1 overflow-auto rounded-lg border">
        <Table className="min-w-full [&_td]:text-left [&_th]:text-left">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Provider</TableHead>
              <TableHead className="font-semibold">Connected</TableHead>
              <TableHead className="font-semibold">Primary</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow key={email._id} className="transition-colors hover:bg-muted/30">
                <TableCell className="font-medium">{email.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      email.provider === "gmail"
                        ? "bg-red-50 text-red-700"
                        : email.provider === "outlook"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-50 text-gray-700"
                    }
                  >
                    {email.provider.charAt(0).toUpperCase() + email.provider.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(email.connectedAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      email.isPrimary
                        ? "bg-green-50 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {email.isPrimary ? "Primary" : "Secondary"}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  {!email.isPrimary && (
                    <Button size="sm" variant="outline" onClick={() => onSetPrimary(email._id)}>
                      Set Primary
                    </Button>
                  )}
                  {!email.isPrimary && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteEmail(email._id)}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
