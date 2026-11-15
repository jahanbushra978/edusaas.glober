import StudentLoginClient from './StudentLoginClient';

export const metadata = {
  title: 'Student Portal Login',
  description: 'Login to access student profile, attendance, and exam results.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentLoginPage() {
  return <StudentLoginClient />;
}
