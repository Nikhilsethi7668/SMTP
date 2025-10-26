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
  isVerified: boolean;
  isActive: boolean;
  isPrimary: boolean;
  verifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EmailTableProps {
  emails: UserEmail[];
  onSetPrimary: (emailId: string) => void;
  onDeleteEmail: (emailId: string) => void;
}

export const EmailTable: React.FC<EmailTableProps> = ({
  emails,
  onSetPrimary,
  onDeleteEmail,
}) => {
  return (
    <div className="h-full w-full flex flex-col p-4">
      <div className="flex-1 overflow-auto border rounded-lg">
        <Table className="[&_th]:text-left [&_td]:text-left min-w-full">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Verified</TableHead>
              <TableHead className="font-semibold">Active</TableHead>
              <TableHead className="font-semibold">Primary</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow
                key={email._id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-medium">{email.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={email.isVerified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}
                  >
                    {email.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={email.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}
                  >
                    {email.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={email.isPrimary ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"}
                  >
                    {email.isPrimary ? "Primary" : "Secondary"}
                  </Badge>
                </TableCell>
                {!email.isPrimary && (

                <TableCell className="flex gap-2">
                  {!email.isPrimary && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSetPrimary(email._id)}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeleteEmail(email._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
