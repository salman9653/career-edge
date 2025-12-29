'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSession } from '@/hooks/use-session';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { MoreVertical, PlusCircle, UserCog, ShieldX, Shield, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AddManagerDialog } from '../../../profile/_components/add-manager-dialog';
import { inviteManagerAction, updateManagerStatusAction, updateManagerRoleAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { InviteLinkDialog } from '../../../profile/_components/invite-link-dialog';

interface ManagerProfile {
    id: string;
    name: string;
    email: string;
    designation: string;
    permissions_role: string;
    status: 'active' | 'inactive' | 'invited' | 'banned';
    avatar?: string;
    uid?: string;
}

export function CompanyManagersContent() {
  const { session, loading: sessionLoading } = useSession();
  const [managers, setManagers] = useState<ManagerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
  const { toast } = useToast();
  const [isInvitePending, startInviteTransition] = useTransition();

  const [isInviteLinkDialogOpen, setInviteLinkDialogOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  
  useEffect(() => {
    if (session?.uid) {
        if (session.role === 'company' || session.role === 'manager') {
            const companyId = session.role === 'company' ? session.uid : session.company_uid;
            if (!companyId) {
                setLoading(false);
                return;
            }
            const managersQuery = query(collection(db, 'users'), where('company_uid', '==', companyId));
            const unsubscribe = onSnapshot(managersQuery, (snapshot) => {
                const managersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManagerProfile));
                setManagers(managersList);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    } else if (!sessionLoading) {
        setLoading(false);
    }
  }, [session, sessionLoading]);
  
  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  const handleInvite = (managerId: string) => {
    startInviteTransition(async () => {
      const result = await inviteManagerAction(managerId);
      if (result.success && result.token) {
        const fullInviteLink = `${window.location.origin}/accept-invite?token=${result.token}`;
        setInviteLink(fullInviteLink);
        setInviteLinkDialogOpen(true);
        toast({ title: 'Invitation link generated!' });
      } else if ('error' in result) {
        toast({ variant: 'destructive', title: 'Invitation Failed', description: result.error });
      }
    });
  };

  const handleStatusUpdate = async (managerId: string, newStatus: 'active' | 'banned') => {
    const result = await updateManagerStatusAction(managerId, newStatus);
    if (result.success) {
        toast({ title: `Manager status updated.` });
    } else if ('error' in result) {
        toast({ variant: 'destructive', title: 'Update failed', description: result.error });
    }
  };

  const handleRoleUpdate = async (managerId: string, newRole: 'Admin' | 'Editor' | 'Viewer') => {
    const result = await updateManagerRoleAction(managerId, newRole);
    if (result.success) {
        toast({ title: 'Manager role updated.' });
    } else if ('error' in result) {
        toast({ variant: 'destructive', title: 'Update failed', description: result.error });
    }
  };

  if (sessionLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  }
  
  if (!session || (session.role !== 'company' && session.role !== 'manager')) {
    return <div className="flex min-h-screen items-center justify-center"><p>Access Denied</p></div>;
  }
  
  const companyId = session.role === 'company' ? session.uid : session.company_uid;
  if (!companyId) {
      return <div className="flex min-h-screen items-center justify-center"><p>Company not found.</p></div>;
  }


  const getStatusVariant = (status: ManagerProfile['status']) => {
    switch (status) {
        case 'active': return 'default';
        case 'inactive': return 'secondary';
        case 'invited': return 'outline';
        case 'banned': return 'destructive';
        default: return 'secondary';
    }
  }

  const getStatusDisplay = (status: ManagerProfile['status']) => {
    if (status === 'banned') return 'Blocked';
    return status;
  }

  return (
    <>
      <AddManagerDialog 
        open={isAddManagerOpen}
        onOpenChange={setIsAddManagerOpen}
        companyId={companyId}
      />
      <InviteLinkDialog
        open={isInviteLinkDialogOpen}
        onOpenChange={setInviteLinkDialogOpen}
        inviteLink={inviteLink}
      />
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Manage Team</CardTitle>
                <CardDescription>Manage who has access to your company's account.</CardDescription>
              </div>
              <Button onClick={() => setIsAddManagerOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Manager
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.length > 0 ? (
                  managers.map(manager => (
                  <TableRow key={manager.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={manager.avatar} />
                        <AvatarFallback>{getInitials(manager.name)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{manager.name}</TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>{manager.designation}</TableCell>
                    <TableCell><Badge variant="outline">{manager.permissions_role}</Badge></TableCell>
                    <TableCell><Badge variant={getStatusVariant(manager.status)} className="capitalize">{getStatusDisplay(manager.status)}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {manager.status === 'inactive' && <DropdownMenuItem onSelect={() => handleInvite(manager.id)} disabled={isInvitePending}>Invite</DropdownMenuItem>}
                          {manager.status === 'invited' && <DropdownMenuItem onSelect={() => handleInvite(manager.id)} disabled={isInvitePending}>Re-invite</DropdownMenuItem>}
                          {manager.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(manager.id, 'banned')}>
                              <ShieldX className="mr-2 h-4 w-4" />
                              Block
                            </DropdownMenuItem>
                          )}
                          {manager.status === 'banned' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(manager.id, 'active')}>
                              <Shield className="mr-2 h-4 w-4" />
                              Unblock
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <UserCog className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => handleRoleUpdate(manager.id, 'Admin')}>Admin</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleUpdate(manager.id, 'Editor')}>Editor</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleUpdate(manager.id, 'Viewer')}>Viewer</DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuItem className="text-destructive" disabled>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No account managers have been added yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
