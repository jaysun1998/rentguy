import React, { useState } from 'react';
import { Card, Button, Input, Select, Typography, Row, Col, Avatar, List, Space, Tag, Divider } from 'antd';
import { 
  EuroOutlined, 
  MessageOutlined, 
  CheckCircleOutlined, 
  PlusOutlined,
  SendOutlined,
  HomeOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Demo: React.FC = () => {
  // Income Tracker State
  const [totalIncome, setTotalIncome] = useState(4200);
  const [incomeAmount, setIncomeAmount] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState('Apartment 1A - Main Street');
  const [selectedIncomeType, setSelectedIncomeType] = useState('Monthly Rent');

  // Chat State
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m your RentGuy assistant. How can I help you today?', sender: 'bot' },
    { id: 2, text: 'Check my rent status', sender: 'user' },
    { id: 3, text: 'Your rent is current for all properties. Next payment due: Aug 1st, 2025', sender: 'bot' },
    { id: 4, text: 'Schedule maintenance', sender: 'user' },
    { id: 5, text: 'I can help schedule that! What type of maintenance do you need?', sender: 'bot' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');

  // Task State
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Inspect plumbing in Unit 2B', completed: false },
    { id: 2, text: 'Schedule carpet cleaning', completed: false },
    { id: 3, text: 'Collect rent from Unit 1A', completed: true },
    { id: 4, text: 'Review lease agreement for Unit 3C', completed: false },
    { id: 5, text: 'Schedule property inspection', completed: false }
  ]);
  const [newTask, setNewTask] = useState('');

  const properties = [
    'Apartment 1A - Main Street',
    'House 2B - Oak Avenue',
    'Studio 3C - Pine Road',
    'Duplex 4D - Elm Street',
    'Townhouse 5E - Maple Lane'
  ];

  const incomeTypes = [
    'Monthly Rent',
    'Security Deposit',
    'Utilities',
    'Late Fee',
    'Maintenance Fee',
    'Other'
  ];

  const addIncome = () => {
    const amount = parseFloat(incomeAmount);
    if (amount && amount > 0) {
      setTotalIncome(prev => prev + amount);
      
      // Add notification to chat
      const notification = {
        id: messages.length + 1,
        text: `Income recorded: €${amount} from ${selectedProperty.split(' - ')[0]}`,
        sender: 'bot'
      };
      setMessages(prev => [...prev, notification]);
      
      setIncomeAmount('');
    }
  };

  const sendMessage = () => {
    if (currentMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: currentMessage,
        sender: 'user'
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Generate smart reply
      const userText = currentMessage.toLowerCase();
      let replyText = 'I understand your request. Let me help you with that.';
      
      if (userText.includes('rent')) {
        replyText = 'All rent payments are current. Next collection date is August 1st, 2025.';
      } else if (userText.includes('maintenance')) {
        replyText = 'I can schedule maintenance for you. What type of work is needed?';
      } else if (userText.includes('tenant')) {
        replyText = 'I can help you manage tenant information and communications.';
      } else if (userText.includes('property')) {
        replyText = 'You currently manage 5 properties. Would you like details on any specific property?';
      } else if (userText.includes('payment')) {
        replyText = 'Payment tracking is available. All recent payments have been processed successfully.';
      }
      
      setTimeout(() => {
        const botReply = {
          id: messages.length + 2,
          text: replyText,
          sender: 'bot'
        };
        setMessages(prev => [...prev, botReply]);
      }, 800);
      
      setCurrentMessage('');
    }
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: tasks.length + 1,
        text: newTask,
        completed: false
      };
      setTasks(prev => [...prev, task]);
      
      // Add notification to chat
      const notification = {
        id: messages.length + 1,
        text: `New task added: ${newTask}`,
        sender: 'bot'
      };
      setMessages(prev => [...prev, notification]);
      
      setNewTask('');
    }
  };

  const toggleTask = (taskId: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, completed: !task.completed };
        
        // Add notification to chat
        const notification = {
          id: messages.length + 1,
          text: updatedTask.completed 
            ? `Task completed: ${task.text}` 
            : `Task reopened: ${task.text}`,
          sender: 'bot'
        };
        setMessages(prevMessages => [...prevMessages, notification]);
        
        return updatedTask;
      }
      return task;
    }));
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px', 
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <Title level={1} style={{ color: 'white', marginBottom: '8px' }}>
            RentGuy Demo
          </Title>
          <Text style={{ color: 'white', opacity: 0.9, fontSize: '18px' }}>
            Property Management System - Live Prototypes
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Income Tracker */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <Space>
                  <EuroOutlined style={{ color: '#1890ff' }} />
                  <span>Income Tracker</span>
                </Space>
              }
              style={{ 
                height: '100%',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text strong>Property</Text>
                  <Select
                    value={selectedProperty}
                    onChange={setSelectedProperty}
                    style={{ width: '100%', marginTop: '8px' }}
                  >
                    {properties.map(property => (
                      <Option key={property} value={property}>{property}</Option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Text strong>Amount (€)</Text>
                  <Input
                    type="number"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    placeholder="Enter amount"
                    style={{ marginTop: '8px' }}
                  />
                </div>
                
                <div>
                  <Text strong>Type</Text>
                  <Select
                    value={selectedIncomeType}
                    onChange={setSelectedIncomeType}
                    style={{ width: '100%', marginTop: '8px' }}
                  >
                    {incomeTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </div>
                
                <Button 
                  type="primary" 
                  onClick={addIncome}
                  style={{ width: '100%' }}
                  size="large"
                >
                  Add Income
                </Button>
                
                <Card 
                  size="small" 
                  style={{ 
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    border: '2px solid #0ea5e9'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">Monthly Total</Text>
                    <Title level={2} style={{ margin: '8px 0', color: '#0ea5e9' }}>
                      €{totalIncome.toLocaleString()}
                    </Title>
                    <Tag color="success">✓ On Track</Tag>
                  </div>
                </Card>
              </Space>
            </Card>
          </Col>

          {/* WhatsApp Chatbot */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <Space>
                  <MessageOutlined style={{ color: '#25d366' }} />
                  <span>WhatsApp Chatbot</span>
                </Space>
              }
              style={{ 
                height: '100%',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ height: '300px', overflowY: 'auto', marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: '12px'
                    }}
                  >
                    <div style={{
                      maxWidth: '80%',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      background: message.sender === 'user' ? '#1890ff' : '#f0f0f0',
                      color: message.sender === 'user' ? 'white' : 'black'
                    }}>
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
              
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type your message..."
                  onPressEnter={sendMessage}
                />
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={sendMessage}
                />
              </Space.Compact>
              
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Tag color="success">✓ Active</Tag>
              </div>
            </Card>
          </Col>

          {/* Task Manager */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>Task Manager</span>
                </Space>
              }
              style={{ 
                height: '100%',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add new task..."
                    onPressEnter={addTask}
                  />
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={addTask}
                  />
                </Space.Compact>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {tasks.map((task) => (
                    <Card 
                      key={task.id}
                      size="small" 
                      style={{ 
                        marginBottom: '8px',
                        background: task.completed ? '#f6ffed' : '#fafafa',
                        border: task.completed ? '1px solid #b7eb8f' : '1px solid #d9d9d9'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <Text 
                          style={{ 
                            textDecoration: task.completed ? 'line-through' : 'none',
                            flex: 1
                          }}
                        >
                          {task.text}
                        </Text>
                        <Button 
                          type={task.completed ? 'default' : 'primary'}
                          size="small"
                          onClick={() => toggleTask(task.id)}
                        >
                          {task.completed ? '↻' : '✓'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <Tag color={pendingTasks === 0 ? 'success' : 'warning'}>
                    {pendingTasks === 0 ? '✓ All Tasks Complete' : `${pendingTasks} Pending Tasks`}
                  </Tag>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Demo;