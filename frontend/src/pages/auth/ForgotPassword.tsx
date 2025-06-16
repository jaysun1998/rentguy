import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Space } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <Title level={3}>Forgot Password</Title>
          <Text type="secondary">
            Enter your email address and we'll send you a link to reset your password
          </Text>
        </div>

        {success ? (
          <div className="text-center">
            <Text type="success">
              Check your email for the password reset link!
            </Text>
            <Button
              type="default"
              onClick={() => navigate('/login')}
              className="mt-4"
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <Form 
            className="space-y-4"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
              validateStatus={error ? 'error' : undefined}
              help={error}
            >
              <Input
                placeholder="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </Form.Item>
            
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Space className="mt-4 justify-between w-full">
              <Link to="/login" className="text-blue-500 hover:text-blue-700">
                Back to Login
              </Link>
              <Link to="/signup" className="text-blue-500 hover:text-blue-700">
                Create Account
              </Link>
            </Space>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
