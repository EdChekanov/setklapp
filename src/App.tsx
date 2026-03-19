import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Space,
  Popconfirm,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

type DataType = {
  key: string;
  name: string;
  date: string;
  value: number;
};

const { Title } = Typography;

export default function App() {
  const [data, setData] = useState<DataType[]>([
    { key: '1', name: 'Example Item', date: '2024-03-19', value: 100 },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    const lowerSearch = searchText.toLowerCase();
    return data.filter((item) => {
      const formattedDate = dayjs(item.date).format('DD.MM.YYYY');
      return (
        item.name.toLowerCase().includes(lowerSearch) ||
        formattedDate.includes(lowerSearch) ||
        item.value.toString().includes(lowerSearch)
      );
    });
  }, [data, searchText]);

  const showModal = (record?: DataType) => {
    if (record) {
      setEditingKey(record.key);
      form.setFieldsValue({
        ...record,
        date: dayjs(record.date),
      });
    } else {
      setEditingKey(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };

      if (editingKey) {
        setData((prev) =>
          prev.map((item) =>
            item.key === editingKey ? { ...item, ...formattedValues } : item,
          ),
        );
      } else {
        const newData: DataType = {
          key: Date.now().toString(),
          ...formattedValues,
        };
        setData((prev) => [...prev, newData]);
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = (key: string) => {
    setData((prev) => prev.filter((item) => item.key !== key));
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (text) => dayjs(text).format('DD.MM.YYYY'),
    },
    {
      title: 'Числовое значение',
      dataIndex: 'value',
      key: 'value',
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-500" />}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Вы уверены, что хотите удалить эту строку?"
            onConfirm={() => handleDelete(record.key)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <Title level={2} className="m-0!">
            Управление данными
          </Title>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Input
              placeholder="Поиск по всем ячейкам..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full sm:w-64"
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              className="bg-blue-600"
            >
              Добавить
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          className="border border-gray-100 rounded-lg overflow-hidden"
        />

        <Modal
          forceRender
          title={editingKey ? 'Редактировать запись' : 'Добавить новую запись'}
          open={isModalVisible}
          onOk={handleSave}
          onCancel={handleCancel}
          okText="Сохранить"
          cancelText="Отмена"
          destroyOnHidden
        >
          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item
              name="name"
              label="Имя"
              rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
            >
              <Input placeholder="Введите имя" />
            </Form.Item>
            <Form.Item
              name="date"
              label="Дата"
              rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
            >
              <DatePicker className="w-full" format="DD.MM.YYYY" />
            </Form.Item>
            <Form.Item
              name="value"
              label="Числовое значение"
              rules={[{ required: true, message: 'Пожалуйста, введите число' }]}
            >
              <InputNumber className="w-full" placeholder="Введите значение" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
