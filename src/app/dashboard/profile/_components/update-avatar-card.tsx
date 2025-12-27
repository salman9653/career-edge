
'use client';
import { useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// This is a placeholder for a real file upload action
async function uploadAvatarAction(formData: FormData) {
    const file = formData.get('avatar') as File;
    if (!file) {
        return { error: 'No file selected.' };
    }
    // In a real app, this would upload to Firebase Storage and return the URL
    console.log("Uploading file:", file.name);
    await new Promise(resolve => setTimeout(resolve, 1500)); // simulate upload
    return { success: 'Avatar updated successfully. Changes will be reflected shortly.' };
}

export function UpdateAvatarCard() {
  const { session } = useSession();
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  const getInitials = (name: string | null) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const result = await uploadAvatarAction(formData);
    
    if (result.success) {
        toast({
            title: 'Success!',
            description: result.success,
        });
    } else if (result.error) {
         toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: result.error,
        });
    }
    setPending(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{session?.role === 'company' ? 'Company Logo' : 'Profile Picture'}</CardTitle>
          <CardDescription>Update your {session?.role === 'company' ? 'logo' : 'avatar'}.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
             <AvatarImage src={session?.role === 'company' ? `https://logo.clearbit.com/${session.email}` : `https://i.pravatar.cc/150?u=${session?.uid}`} />
             <AvatarFallback>{getInitials(session?.name || null)}</AvatarFallback>
          </Avatar>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input id="avatar-upload" name="avatar" type="file" accept="image/*" />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <><Upload className="mr-2 h-4 w-4" /> Upload</>}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
