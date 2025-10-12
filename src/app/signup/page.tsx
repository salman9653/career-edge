
import { redirect } from 'next/navigation'

export default function SignupPage() {
    // Redirect to the main page if someone lands here directly
    redirect('/');
}
