import React, { useState, useEffect } from 'react';
import {
    Result,
    Card,
    Descriptions,
    Button,
    Space,
    Tag,
    Typography,
    Divider,
    Row,
    Col,
    Alert,
    Spin,
    Modal,
    List
} from 'antd';
import {
    CloseCircleOutlined,
    HomeOutlined,
    RedoOutlined,
    PhoneOutlined,
    MailOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    DollarOutlined,
    CalendarOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPaymentByOrderId, cancelPayment } from '../../services/paymentService';

import './PaymentCancelled.scss';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

// ✅ Set Vietnamese locale
dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const PaymentCancelled = () => {
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const orderId = searchParams.get('orderId') || searchParams.get('orderCode');
    const cancelReason = searchParams.get('cancel') || searchParams.get('reason');
    const status = searchParams.get('status');

    // ✅ Vietnamese date formatting
    const formatDateTime = (dateString) => {
        if (!dateString) return dayjs().format('HH:mm:ss DD/MM/YYYY');

        try {
            const date = dayjs(dateString);
            return date.format('HH:mm:ss DD/MM/YYYY');
        } catch (error) {
            console.error('❌ Lỗi định dạng ngày:', error);
            return dayjs().format('HH:mm:ss DD/MM/YYYY');
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return dayjs().format('HH:mm:ss');

        try {
            const date = dayjs(dateString);
            return date.format('HH:mm:ss');
        } catch (error) {
            console.error('❌ Lỗi định dạng giờ:', error);
            return dayjs().format('HH:mm:ss');
        }
    };

    // ✅ Vietnamese amount formatting
    const formatAmount = (amount) => {
        if (!amount && amount !== 0) return '0';
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    // ✅ Vietnamese cancellation reason mapping
    const getCancellationReason = (reason) => {
        const reasonMap = {
            'user': 'Người dùng hủy',
            'timeout': 'Hết thời gian chờ',
            'failed': 'Thanh toán thất bại',
            'system': 'Lỗi hệ thống',
            'insufficient_funds': 'Không đủ số dư',
            'card_declined': 'Thẻ bị từ chối',
            'network_error': 'Lỗi mạng'
        };
        return reasonMap[reason] || 'Đã hủy';
    };

    // ✅ Refund status mapping
    const getRefundStatusInfo = (status) => {
        const statusMap = {
            'completed': { color: 'success', text: 'ĐÃ HOÀN TIỀN' },
            'processing': { color: 'processing', text: 'ĐANG XỬ LÝ' },
            'pending': { color: 'warning', text: 'CHỜ XỬ LÝ' },
            'failed': { color: 'error', text: 'HOÀN TIỀN THẤT BẠI' },
            'no_charge': { color: 'default', text: 'CHƯA THANH TOÁN' }
        };
        return statusMap[status?.toLowerCase()] || { color: 'default', text: 'KHÔNG XÁC ĐỊNH' };
    };

    useEffect(() => {
        if (orderId) {
            fetchPaymentData();
        } else {
            setError('Không tìm thấy mã đơn hàng');
            setLoading(false);
        }
    }, [orderId]);

    const fetchPaymentData = async () => {
        try {
            setLoading(true);
            console.log('🔄 Đang tải dữ liệu thanh toán đã hủy cho đơn hàng:', orderId);

            const response = await getPaymentByOrderId(orderId);
            console.log('📥 Dữ liệu thanh toán đã hủy:', response);

            if (response?.success && response?.result) {
                setPaymentData(response.result);
                setError(null);
                console.log('✅ Đã tải thành công dữ liệu thanh toán đã hủy');
            } else {
                throw new Error(response?.message || 'Không thể tải thông tin thanh toán');
            }
        } catch (error) {
            console.error('❌ Lỗi khi tải dữ liệu thanh toán:', error);
            setError('Không thể tải thông tin thanh toán. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCancellation = () => {
        confirm({
            title: 'Xác Nhận Hủy Thanh Toán',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <Paragraph>
                        Bạn có chắc chắn muốn hủy thanh toán này? Hành động này sẽ:
                    </Paragraph>
                    <ul>
                        <li>Hủy đặt lịch khám của bạn</li>
                        <li>Hoàn tiền (nếu đã được xử lý)</li>
                        <li>Giải phóng lịch khám cho người khác</li>
                    </ul>
                    <Paragraph style={{ color: '#ff4d4f' }}>
                        <strong>Lưu ý:</strong> Việc hoàn tiền có thể mất 3-5 ngày làm việc để xử lý.
                    </Paragraph>
                </div>
            ),
            okText: 'Có, Hủy Thanh Toán',
            okType: 'danger',
            cancelText: 'Giữ Đặt Lịch',
            onOk: performCancellation,
        });
    };

    const performCancellation = async () => {
        try {
            setCancelling(true);
            console.log('🔄 Đang hủy thanh toán cho đơn hàng:', orderId);

            const cancelData = {
                reason: cancelReason || 'Người dùng yêu cầu hủy',
                cancelledAt: new Date().toISOString()
            };

            await cancelPayment(orderId, cancelData);
            console.log('✅ Đã hủy thanh toán thành công');

            await fetchPaymentData();

            Modal.success({
                title: 'Đã Hủy Thanh Toán',
                content: 'Thanh toán của bạn đã được hủy thành công. Tiền hoàn sẽ được xử lý trong vòng 3-5 ngày làm việc.',
            });
        } catch (error) {
            console.error('❌ Lỗi khi hủy thanh toán:', error);
            Modal.error({
                title: 'Hủy Thất Bại',
                content: 'Không thể hủy thanh toán. Vui lòng liên hệ hỗ trợ để được trợ giúp.',
            });
        } finally {
            setCancelling(false);
        }
    };

    const handleRetryPayment = () => {
        navigate(`/payment/retry?orderId=${orderId}`);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleBookNewAppointment = () => {
        navigate('/booking');
    };

    // ✅ Loading state
    if (loading) {
        return (
            <div className="payment-loading" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                flexDirection: 'column'
            }}>
                <Spin size="large" tip="Đang tải thông tin thanh toán..." />
            </div>
        );
    }

    // ✅ Error state
    if (error) {
        return (
            <div className="payment-error">
                <Result
                    status="error"
                    title="Lỗi Tải Thông Tin Thanh Toán"
                    subTitle={error}
                    extra={
                        <Space>
                            <Button type="primary" onClick={handleGoHome}>
                                Về Trang Chủ
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                                Thử Lại
                            </Button>
                        </Space>
                    }
                />
            </div>
        );
    }

    const refundInfo = getRefundStatusInfo(paymentData?.refundStatus);

    return (
        <div className="payment-cancelled-container">
            <div className="payment-cancelled-content">
                {/* ✅ Main Result */}
                <Result
                    status="error"
                    title="Thanh Toán Đã Bị Hủy"
                    subTitle={
                        <div>
                            <Paragraph>
                                Thanh toán của bạn đã bị hủy và việc đặt lịch khám không được hoàn thành.
                            </Paragraph>
                            <Text type="secondary">
                                Mã đơn hàng: <Text code>{paymentData?.orderCode || orderId}</Text>
                            </Text>
                            <br />
                            <Text type="secondary">
                                Mã giao dịch: <Text code>{paymentData?.id}</Text>
                            </Text>
                        </div>
                    }
                    icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                />

                {/* ✅ Cancellation Alert */}
                <Alert
                    message="Thanh Toán Đã Hủy"
                    description={
                        <div>
                            <Paragraph style={{ margin: 0 }}>
                                {cancelReason === 'user'
                                    ? 'Bạn đã hủy quá trình thanh toán. Tài khoản của bạn sẽ không bị tính phí.'
                                    : cancelReason === 'timeout'
                                        ? 'Phiên thanh toán đã hết hạn. Vui lòng thử đặt lịch lại.'
                                        : paymentData?.cancellationReason || 'Thanh toán đã bị hủy. Vui lòng liên hệ hỗ trợ nếu điều này không mong muốn.'
                                }
                            </Paragraph>
                            
                        </div>
                    }
                    type="warning"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <Row gutter={24}>
                    {/* ✅ Cancellation Details */}
                    <Col xs={24} lg={14}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <InfoCircleOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                                    Chi Tiết Hủy Thanh Toán
                                </div>
                            }
                            className="cancellation-details-card"
                        >
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Mã đơn hàng">
                                    <Text code>{paymentData?.orderCode || orderId}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Mã giao dịch">
                                    <Text code>{paymentData?.id}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian hủy">
                                    <Text>
                                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                                        {formatDateTime(paymentData?.canceledAt || paymentData?.createdAt)}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Lý do hủy">
                                    <Tag color="orange">
                                        {paymentData?.cancellationReason || getCancellationReason(cancelReason)}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số tiền">
                                    <Text style={{ fontSize: '16px' }}>
                                        {formatAmount(paymentData?.amount)} VND
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số tiền đã thanh toán">
                                    <Text strong style={{ color: '#52c41a' }}>
                                        {formatAmount(paymentData?.amountPaid)} VND
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số tiền còn lại">
                                    <Text strong style={{ color: '#faad14' }}>
                                        {formatAmount(paymentData?.amountRemaining)} VND
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color="error" icon={<CloseCircleOutlined />}>
                                        ĐÃ HỦY
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phương thức thanh toán">
                                    <Tag color="blue">PayOS</Tag>
                                </Descriptions.Item>
                                
                            </Descriptions>

                            <Divider />



                            {/* ✅ Transactions History */}
                            {paymentData?.transactions && paymentData.transactions.length > 0 && (
                                <>
                                    <Divider />
                                    <Title level={5}>
                                        <DollarOutlined style={{ marginRight: 8 }} />
                                        Lịch Sử Giao Dịch
                                    </Title>
                                    {paymentData.transactions.map((transaction, index) => (
                                        <Card key={index} size="small" style={{ marginBottom: 8 }}>
                                            <Descriptions column={2} size="small">
                                                <Descriptions.Item label="Mã giao dịch">
                                                    <Text code>{transaction.id || `TXN-${index + 1}`}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Số tiền">
                                                    <Text strong>{formatAmount(transaction.amount)} VND</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Trạng thái">
                                                    <Tag color={transaction.status === 'SUCCESS' ? 'success' : 'error'}>
                                                        {transaction.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                                                    </Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Thời gian">
                                                    <Text>{formatDateTime(transaction.createdAt)}</Text>
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    ))}
                                </>
                            )}
                        </Card>
                    </Col>

                    {/* ✅ Actions & Support */}
                    <Col xs={24} lg={10}>
                        {/* ✅ Next Actions */}
                        <Card
                            title="Bạn muốn làm gì?"
                            style={{ marginBottom: 16 }}
                            size="small"
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Button
                                    type="primary"
                                    icon={<RedoOutlined />}
                                    block
                                    onClick={handleRetryPayment}
                                    size="large"
                                >
                                    Thử Thanh Toán Lại
                                </Button>

                                <Button
                                    icon={<CalendarOutlined />}
                                    block
                                    onClick={handleBookNewAppointment}
                                >
                                    Đặt Lịch Khám Mới
                                </Button>

                                <Divider style={{ margin: '12px 0' }} />

                                <Button
                                    icon={<HomeOutlined />}
                                    block
                                    onClick={handleGoHome}
                                >
                                    Về Trang Chủ
                                </Button>

                                {paymentData?.status !== 'CANCELLED' && (
                                    <>
                                        <Divider style={{ margin: '12px 0' }} />
                                        <Button
                                            danger
                                            block
                                            loading={cancelling}
                                            onClick={handleConfirmCancellation}
                                        >
                                            Xác Nhận Hủy
                                        </Button>
                                    </>
                                )}
                            </Space>
                        </Card>

                        {/* ✅ Common Cancellation Reasons */}
                        <Card title="Lý Do Hủy Phổ Biến" size="small" style={{ marginBottom: 16 }}>
                            <List
                                size="small"
                                dataSource={[
                                    'Thay đổi ý định về cuộc hẹn',
                                    'Vấn đề phương thức thanh toán',
                                    'Cần đổi lịch sang thời gian khác',
                                    'Tìm được nhà cung cấp y tế khác',
                                    'Lỗi kỹ thuật trong quá trình thanh toán'
                                ]}
                                renderItem={(item, index) => (
                                    <List.Item style={{ padding: '4px 0' }}>
                                        <Text style={{ fontSize: '12px' }}>
                                            {index + 1}. {item}
                                        </Text>
                                    </List.Item>
                                )}
                            />
                        </Card>

                        {/* ✅ Support Information */}
                        <Card title="Cần Trợ Giúp?" size="small">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <Text strong style={{ fontSize: '12px' }}>Liên Hệ Hỗ Trợ:</Text>
                                </div>

                                <Button
                                    icon={<PhoneOutlined />}
                                    size="small"
                                    block
                                    href="tel:1900-1234"
                                >
                                    Gọi: 1900-1234
                                </Button>

                                <Button
                                    icon={<MailOutlined />}
                                    size="small"
                                    block
                                    href="mailto:hotro@benhvien.com"
                                >
                                    Email: hotro@benhvien.com
                                </Button>
                            </Space>

                            <Alert
                                message="Chính Sách Hoàn Tiền"
                                description="Nếu thanh toán đã được xử lý, tiền hoàn thường mất 3-5 ngày làm việc để xuất hiện trong tài khoản của bạn."
                                type="info"
                                showIcon
                                style={{ marginTop: 12, fontSize: '11px' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PaymentCancelled;