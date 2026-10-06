import React from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';

type AuthMode = 'login' | 'register';
interface AuthFormValues { fullName?: string; studentId?: string; className?: string; email: string; password: string; confirmPassword?: string; }

export const AuthPage: React.FC<{ mode: AuthMode }> = ({ mode }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error, login, register } = useAuth();
  const [form] = Form.useForm<AuthFormValues>();
  if (isAuthenticated) return <Navigate to="/profile" replace />;
  const isRegister = mode === 'register';
  const submit = async (values: AuthFormValues) => {
    try {
      if (isRegister) await register({ fullName: values.fullName!, studentId: values.studentId!, className: values.className, email: values.email, password: values.password });
      else await login({ email: values.email, password: values.password });
      navigate('/profile', { replace: true });
    } catch { /* Redux state renders the API error. */ }
  };
  return <main className="min-h-screen bg-sky-50 flex items-center justify-center p-6">
    <Card className="w-full max-w-[440px] !rounded-[24px] shadow-[0_12px_35px_rgba(0,153,255,0.13)] border border-solid border-sky-100">
      <Typography.Title level={2} className="!text-center !mb-1 !text-slate-900">{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</Typography.Title>
      <Typography.Paragraph className="!text-center !text-slate-500">Environment Monitoring System</Typography.Paragraph>
      {error && <Alert className="mb-5" type="error" showIcon message={error} />}
      <Form form={form} layout="vertical" onFinish={submit} requiredMark={false}>
        {isRegister && <>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên.' }]}><Input size="large" /></Form.Item>
          <Form.Item name="studentId" label="Mã sinh viên" rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên.' }]}><Input size="large" /></Form.Item>
          <Form.Item name="className" label="Lớp"><Input size="large" /></Form.Item>
        </>}
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ.' }]}><Input size="large" autoComplete="email" /></Form.Item>
        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 8, message: 'Mật khẩu tối thiểu 8 ký tự.' }]}><Input.Password size="large" autoComplete={isRegister ? 'new-password' : 'current-password'} /></Form.Item>
        {isRegister && <Form.Item name="confirmPassword" label="Xác nhận mật khẩu" dependencies={['password']} rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu.' }, ({ getFieldValue }) => ({ validator: (_, value) => !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('Mật khẩu xác nhận không khớp.')) })]}><Input.Password size="large" autoComplete="new-password" /></Form.Item>}
        <Button htmlType="submit" type="primary" size="large" block loading={isLoading} className="!bg-[#0099FF] !border-[#0099FF] !h-11">{isRegister ? 'Đăng ký' : 'Đăng nhập'}</Button>
      </Form>
      <div className="text-center mt-5 text-slate-600">{isRegister ? <>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></> : <>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></>}</div>
    </Card>
  </main>;
};
