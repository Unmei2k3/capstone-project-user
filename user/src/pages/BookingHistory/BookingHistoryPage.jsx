import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Card,
    Table,
    Tag,
    Button,
    Space,
    Typography,
    Row,
    Col,
    Input,
    Select,
    DatePicker,
    message,
    Spin,
    Empty,
    Tooltip
} from 'antd';
import {
    CalendarOutlined,
    SearchOutlined,
    EyeOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { getAppointmentByUserId, cancelAppointment } from '../../services/appointmentService';
import BookingDetailDrawer from './BookingDetailDrawer';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/vi'; // ✅ Import Vietnamese locale
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import locale from 'antd/locale/vi_VN'; // ✅ Import Ant Design Vietnamese locale

// ✅ Configure dayjs plugins and locale
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi'); // ✅ Set Vietnamese as default locale

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ✅ Vietnamese locale config for DatePicker
const viLocale = {
    ...locale,
    DatePicker: {
        ...locale.DatePicker,
        lang: {
            ...locale.DatePicker.lang,
            placeholder: 'Chọn ngày',
            yearPlaceholder: 'Chọn năm',
            quarterPlaceholder: 'Chọn quý',
            monthPlaceholder: 'Chọn tháng',
            weekPlaceholder: 'Chọn tuần',
            rangePlaceholder: ['Từ ngày', 'Đến ngày'],
            rangeYearPlaceholder: ['Từ năm', 'Đến năm'],
            rangeMonthPlaceholder: ['Từ tháng', 'Đến tháng'],
            rangeWeekPlaceholder: ['Từ tuần', 'Đến tuần'],
            today: 'Hôm nay',
            now: 'Bây giờ',
            backToToday: 'Quay lại hôm nay',
            ok: 'Đồng ý',
            clear: 'Xóa',
            month: 'Tháng',
            year: 'Năm',
            timeSelect: 'Chọn thời gian',
            dateSelect: 'Chọn ngày',
            weekSelect: 'Chọn tuần',
            monthSelect: 'Chọn tháng',
            yearSelect: 'Chọn năm',
            decadeSelect: 'Chọn thập kỷ',
            yearFormat: 'YYYY',
            dateFormat: 'DD/MM/YYYY',
            dayFormat: 'DD',
            dateTimeFormat: 'DD/MM/YYYY HH:mm:ss',
            monthBeforeYear: true, // ✅ Changed from false to true
            previousMonth: 'Tháng trước (PageUp)',
            nextMonth: 'Tháng sau (PageDown)',
            previousYear: 'Năm trước (Control + trái)',
            nextYear: 'Năm sau (Control + phải)',
            previousDecade: 'Thập kỷ trước',
            nextDecade: 'Thập kỷ sau',
            previousCentury: 'Thế kỷ trước',
            nextCentury: 'Thế kỷ sau'
        }
    }
};

const BookingHistory = () => {
    // ✅ Get user from Redux store
    const user = useSelector((state) => state.user?.user);

    // ✅ States
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);

    // ✅ Get current user ID from Redux store
    const getCurrentUserId = () => {
        console.log('👤 Getting user from Redux store:', user);
        return user?.id || user?.userId;
    };

    // ✅ Fetch appointments from backend
    const fetchAppointments = async () => {
        console.log('📞 Starting fetchAppointments...');
        setLoading(true);
        try {
            const userId = getCurrentUserId();
            if (!userId) {
                message.warning('Vui lòng đăng nhập để xem lịch hẹn');
                console.error('❌ No user ID found, cannot fetch appointments');
                setLoading(false);
                return;
            }

            console.log('📅 Fetching appointments for user:', userId);
            const response = await getAppointmentByUserId(userId);
            console.log('📦 Raw API response:', response);

            // Handle response structure
            const appointmentsData = response.result || response.data || response || [];
            console.log('✅ Appointments fetched:', appointmentsData.length);

            if (appointmentsData.length === 0) {
                console.log('📭 No appointments found');
                message.info('Bạn chưa có lịch hẹn nào');
                setAppointments([]);
                setFilteredAppointments([]);
                return;
            }

            // ✅ Transform backend data to frontend format with proper date handling
            const transformedAppointments = appointmentsData.map((appointment, index) => {
                // Debug first few appointments to understand structure
                if (index < 3) {
                    console.log(`🔍 Appointment ${index + 1} structure:`, appointment);
                    console.log(`🔍 Keys:`, Object.keys(appointment));
                }

                // ✅ Parse appointmentTime properly with Vietnamese locale
                const appointmentTime = appointment.appointmentTime;
                let parsedDate = null;
                let formattedDate = 'Chưa xác định';
                let formattedTime = 'Chưa xác định';

                if (appointmentTime) {
                    try {
                        parsedDate = dayjs(appointmentTime).locale('vi');
                        if (parsedDate.isValid()) {
                            formattedDate = parsedDate.format('DD/MM/YYYY');
                            formattedTime = parsedDate.format('HH:mm');
                        } else {
                            console.warn('⚠️ Invalid date:', appointmentTime);
                        }
                    } catch (error) {
                        console.error('❌ Error parsing date:', appointmentTime, error);
                    }
                }

                return {
                    id: appointment.id,
                    bookingId: `${String(appointment.id).padStart(6, '0')}`,
                    bookingDate: formattedDate,
                    appointmentTime: formattedTime,
                    appointmentDate: parsedDate, // ✅ Store as dayjs object for filtering
                    appointmentDateISO: appointmentTime, // ✅ Store original ISO string
                    status: mapBackendStatus(appointment.status),

                    // Patient information (using current user data)
                    patientName: user?.name || user?.fullName || 'Chưa có thông tin',
                    patientPhone: user?.phone || 'Chưa có thông tin',
                    patientEmail: user?.email || 'Chưa có thông tin',

                    // Hospital information from doctorSchedule.hospital
                    hospital: appointment.doctorSchedule?.hospital?.name || 'Chưa có thông tin',
                    hospitalAddress: appointment.doctorSchedule?.hospital?.address || '',
                    hospitalImage: appointment.doctorSchedule?.hospital?.image || '',

                    // Department/Service information
                    department: appointment.serviceName || 'Chưa có thông tin',
                    serviceName: appointment.serviceName || 'Chưa có thông tin',

                    // Doctor information from doctorSchedule.doctorProfile
                    doctor: appointment.doctorSchedule?.doctorProfile?.description ||
                        appointment.doctorSchedule?.doctorProfile?.user?.name ||
                        'Chưa có thông tin',
                    doctorDescription: appointment.doctorSchedule?.doctorProfile?.description || '',

                    // Room information
                    room: appointment.doctorSchedule?.room?.name ||
                        appointment.doctorSchedule?.room?.roomCode ||
                        'Chưa có thông tin',
                    roomCode: appointment.doctorSchedule?.room?.roomCode || '',

                    // Schedule information
                    workDate: appointment.doctorSchedule?.workDate
                        ? dayjs(appointment.doctorSchedule.workDate).locale('vi').format('DD/MM/YYYY')
                        : '',
                    startTime: appointment.doctorSchedule?.startTime || '',
                    endTime: appointment.doctorSchedule?.endTime || '',

                    // Additional info
                    symptoms: appointment.note || 'Không có mô tả',
                    notes: appointment.note || '',
                    fee: appointment.servicePrice || 0,
                    appointmentNumber: appointment.appointmentNumber || 0,

                    // Keep original data for debugging
                    originalData: appointment
                };
            });

            console.log('🔄 Transformed appointments sample:', transformedAppointments.slice(0, 2));
            console.log('🔄 Status distribution:', transformedAppointments.reduce((acc, app) => {
                acc[app.status] = (acc[app.status] || 0) + 1;
                return acc;
            }, {}));

            setAppointments(transformedAppointments);
            setFilteredAppointments(transformedAppointments);

            message.success(`Đã tải ${transformedAppointments.length} lịch hẹn`);

        } catch (error) {
            console.error('❌ Error fetching appointments:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            message.error(`Không thể tải danh sách lịch hẹn: ${error.message}`);

            // Reset to empty state on error
            setAppointments([]);
            setFilteredAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Map backend status to frontend status
    const mapBackendStatus = (backendStatus) => {
        console.log('🔍 Mapping status:', backendStatus, 'Type:', typeof backendStatus);

        // Handle null, undefined, or empty values
        if (!backendStatus && backendStatus !== 0) {
            console.log('⚠️ Empty status, defaulting to pending');
            return 'pending';
        }

        // Convert to string for consistent handling
        const statusValue = String(backendStatus);

        // Handle numeric statuses (corrected mapping)
        const numericStatusMap = {
            '1': 'pending',      // Chờ xác nhận
            '2': 'confirmed',    // Đã xác nhận  
            '3': 'cancelled',    // Đã hủy
            '4': 'completed'     // Hoàn thành
        };

        // Handle string statuses (fallback)
        const stringStatusMap = {
            'PENDING': 'pending',
            'CONFIRMED': 'confirmed',
            'COMPLETED': 'completed',
            'CANCELLED': 'cancelled',
            'SCHEDULED': 'confirmed',
            'FINISHED': 'completed',
            'CANCELED': 'cancelled'
        };

        let mappedStatus;

        // Try numeric mapping first
        if (numericStatusMap[statusValue]) {
            mappedStatus = numericStatusMap[statusValue];
            console.log(`✅ Numeric mapping: ${backendStatus} → ${mappedStatus}`);
        } else {
            // Try string mapping
            mappedStatus = stringStatusMap[statusValue.toUpperCase()] || statusValue.toLowerCase();
            console.log(`✅ String mapping: ${backendStatus} → ${mappedStatus}`);
        }

        return mappedStatus;
    };

    // ✅ Load appointments on component mount
    useEffect(() => {
        console.log('🔥 useEffect triggered - fetching appointments');
        console.log('👤 Current user from Redux:', user);
        fetchAppointments();
    }, []);

    // ✅ Filter appointments based on search criteria - FIXED DATE FILTERING
    useEffect(() => {
        let filtered = [...appointments];

        // Filter by search text
        if (searchText.trim()) {
            filtered = filtered.filter(appointment =>
                appointment.bookingId?.toLowerCase().includes(searchText.toLowerCase()) ||
                appointment.doctor?.toLowerCase().includes(searchText.toLowerCase()) ||
                appointment.hospital?.toLowerCase().includes(searchText.toLowerCase()) ||
                appointment.serviceName?.toLowerCase().includes(searchText.toLowerCase()) ||
                appointment.department?.toLowerCase().includes(searchText.toLowerCase()) ||
                appointment.room?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(appointment => appointment.status === statusFilter);
        }

        // ✅ Fixed date range filtering
        if (dateRange && dateRange.length === 2) {
            const [startDate, endDate] = dateRange;
            console.log('📅 Filtering by date range:', {
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
                totalAppointments: filtered.length
            });

            filtered = filtered.filter(appointment => {
                // ✅ Check if appointmentDate exists and is valid
                if (!appointment.appointmentDate || !appointment.appointmentDate.isValid()) {
                    console.warn('⚠️ Invalid appointment date for filtering:', appointment);
                    return false;
                }

                // ✅ Use dayjs isBetween method properly
                const isInRange = appointment.appointmentDate.isBetween(startDate, endDate, 'day', '[]');

                if (isInRange) {
                    console.log('✅ Appointment in range:', {
                        bookingId: appointment.bookingId,
                        date: appointment.appointmentDate.format('YYYY-MM-DD'),
                        formatted: appointment.bookingDate
                    });
                }

                return isInRange;
            });

            console.log(`📊 After date filtering: ${filtered.length} appointments remaining`);
        }

        setFilteredAppointments(filtered);
    }, [appointments, searchText, statusFilter, dateRange]);

    // ✅ Handle view detail
    const handleViewDetail = (appointment) => {
        console.log('👀 Viewing appointment detail:', appointment);
        setSelectedBooking(appointment);
        setDrawerVisible(true);
    };

    // ✅ Handle cancel appointment
    const handleCancelBooking = async (appointmentId) => {
        setCancellingId(appointmentId);
        try {
            console.log('❌ Cancelling appointment:', appointmentId);
            await cancelAppointment(appointmentId);

            message.success('Hủy lịch hẹn thành công');

            // Update local state
            setAppointments(prev =>
                prev.map(appointment =>
                    appointment.id === appointmentId
                        ? { ...appointment, status: 'cancelled' }
                        : appointment
                )
            );

        } catch (error) {
            console.error('❌ Error cancelling appointment:', error);
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Không thể hủy lịch hẹn';
            message.error(errorMessage);
        } finally {
            setCancellingId(null);
        }
    };

    // ✅ Get status info for display
    const getStatusInfo = (status) => {
        const statusMap = {
            'completed': { color: 'green', text: 'Hoàn thành' },
            'confirmed': { color: 'blue', text: 'Đã xác nhận' },
            'pending': { color: 'orange', text: 'Chờ xác nhận' },
            'cancelled': { color: 'red', text: 'Đã hủy' }
        };
        return statusMap[status] || { color: 'default', text: status };
    };

    // ✅ Table columns
    const columns = [
        {
            title: 'Mã đặt khám',
            dataIndex: 'bookingId',
            key: 'bookingId',
            width: 120,
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Ngày khám',
            dataIndex: 'bookingDate',
            key: 'bookingDate',
            width: 120,
            render: (date, record) => (
                <div>
                    <div><CalendarOutlined /> {date}</div>

                </div>
            )
        },
        {
            title: 'Bệnh viện',
            dataIndex: 'hospital',
            key: 'hospital',
            ellipsis: {
                showTitle: false,
            },
            render: (text) => (
                <Tooltip placement="topLeft" title={text || 'Chưa có thông tin'}>
                    {text || 'Chưa có thông tin'}
                </Tooltip>
            )
        },
        {
            title: 'Dịch vụ/Chuyên khoa',
            dataIndex: 'serviceName',
            key: 'serviceName',
            width: 180,
            ellipsis: {
                showTitle: false,
            },
            render: (text) => (
                <Tooltip placement="topLeft" title={text || 'Chưa có thông tin'}>
                    {text || 'Chưa có thông tin'}
                </Tooltip>
            )
        },
        {
            title: 'Bác sĩ',
            dataIndex: 'doctor',
            key: 'doctor',
            width: 150,
            ellipsis: {
                showTitle: false,
            },
            render: (text, record) => (
                <div>
                    <Tooltip placement="topLeft" title={text || 'Chưa có thông tin'}>
                        <div>{text || 'Chưa có thông tin'}</div>
                    </Tooltip>
                    {record.room && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Phòng: {record.room}
                        </Text>
                    )}
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const statusInfo = getStatusInfo(status);
                return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
            }
        },
        {
            title: 'Phí khám',
            dataIndex: 'fee',
            key: 'fee',
            width: 120,
            render: (fee) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {fee?.toLocaleString() || 0} VNĐ
                </Text>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            ghost
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>

                    {record.status === 'pending' && (
                        <Tooltip title="Hủy lịch hẹn">
                            <Button
                                danger
                                size="small"
                                icon={<CloseCircleOutlined />}
                                loading={cancellingId === record.id}
                                onClick={() => handleCancelBooking(record.id)}
                            />
                        </Tooltip>
                    )}

                    {record.status === 'completed' && (
                        <Tooltip title="Xem phiếu khám">
                            <Button
                                type="default"
                                size="small"
                                icon={<FileTextOutlined />}
                                onClick={() => message.info('Tính năng đang phát triển')}
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                {/* Header */}
                <Row align="middle" style={{ marginBottom: 24 }}>
                    <Col flex="auto">
                        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                            <CalendarOutlined style={{ marginRight: 12 }} />
                            Lịch sử đặt khám
                        </Title>
                        <Text type="secondary">
                            Quản lý và theo dõi các lịch hẹn khám bệnh của bạn
                        </Text>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            loading={loading}
                            onClick={fetchAppointments}
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>

                {/* Filters */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} md={8}>
                        <Input
                            placeholder="Tìm theo mã đặt khám, bác sĩ, bệnh viện..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>

                    <Col xs={24} md={6}>
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: '100%' }}
                            value={statusFilter}
                            onChange={setStatusFilter}
                        >
                            <Option value="all">Tất cả</Option>
                            <Option value="pending">Chờ xác nhận</Option>
                            <Option value="confirmed">Đã xác nhận</Option>
                            <Option value="completed">Hoàn thành</Option>
                            <Option value="cancelled">Đã hủy</Option>
                        </Select>
                    </Col>

                    <Col xs={24} md={10}>
                        {/* ✅ RangePicker with Vietnamese locale */}
                        <RangePicker
                            style={{ width: '100%' }}
                            placeholder={['Từ ngày', 'Đến ngày']}
                            format="DD/MM/YYYY"
                            value={dateRange}
                            onChange={setDateRange}
                            locale={viLocale.DatePicker}
                            allowClear
                            showToday={false}
                        />
                    </Col>
                </Row>

                {/* Statistics */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={12} md={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ color: '#1890ff', fontSize: '20px', fontWeight: 'bold' }}>
                                {appointments.length}
                            </div>
                            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                Tổng lịch hẹn
                            </div>
                        </Card>
                    </Col>
                    <Col xs={12} md={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}>
                                {appointments.filter(a => a.status === 'completed').length}
                            </div>
                            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                Đã hoàn thành
                            </div>
                        </Card>
                    </Col>
                    <Col xs={12} md={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ color: '#faad14', fontSize: '20px', fontWeight: 'bold' }}>
                                {appointments.filter(a => a.status === 'pending').length}
                            </div>
                            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                Chờ xác nhận
                            </div>
                        </Card>
                    </Col>
                    <Col xs={12} md={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ color: '#ff4d4f', fontSize: '20px', fontWeight: 'bold' }}>
                                {appointments.filter(a => a.status === 'cancelled').length}
                            </div>
                            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                Đã hủy
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Table */}
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={filteredAppointments}
                        rowKey="id"
                        pagination={{
                            total: filteredAppointments.length,
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} lịch hẹn`,
                        }}
                        locale={{
                            emptyText: (
                                <Empty
                                    description="Chưa có lịch hẹn nào"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )
                        }}
                        scroll={{ x: 800 }}
                    />
                </Spin>

                {/* Detail Drawer */}
                <BookingDetailDrawer
                    booking={selectedBooking}
                    visible={drawerVisible}
                    onClose={() => {
                        setDrawerVisible(false);
                        setSelectedBooking(null);
                    }}
                />
            </Card>
        </div>
    );
};

export default BookingHistory;