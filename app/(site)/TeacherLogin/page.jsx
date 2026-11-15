import TeacherLoginClient from './TeacherLoginClient';

export const metadata = {
  title: 'Teacher Portal Login',
  description: 'Login to access teacher dashboard, attendance, and grading.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TeacherLoginPage() {
  return <TeacherLoginClient />;
}
