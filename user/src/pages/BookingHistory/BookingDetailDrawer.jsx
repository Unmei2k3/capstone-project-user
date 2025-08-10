import React from 'react';
import {
  Drawer,
  Typography,
  Descriptions,
  Tag,
  Divider,
  Button,
  Row,
  Col,
  Space,
  message
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  DollarOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  BookOutlined,
  HomeOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const BookingDetailDrawer = ({ booking, visible, onClose }) => {
  if (!booking) return null;

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'green', text: 'Hoàn thành' };
      case 'confirmed':
        return { color: 'blue', text: 'Đã xác nhận' };
      case 'pending':
        return { color: 'orange', text: 'Chờ xác nhận' };
      case 'cancelled':
        return { color: 'red', text: 'Đã hủy' };
      default:
        return { color: 'default', text: status };
    }
  };

  const statusInfo = getStatusInfo(booking.status);

  // ✅ Handle actions
  const handleCancelAppointment = () => {
    // This should call parent component's cancel function
    message.info('Tính năng hủy lịch hẹn đang được phát triển');
  };

  const handleViewMedicalRecord = () => {
    message.info('Tính năng xem phiếu khám đang được phát triển');
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MedicineBoxOutlined style={{ marginRight: 8, fontSize: 18 }} />
          <span>Chi tiết đặt khám</span>
          <Tag color={statusInfo.color} style={{ marginLeft: 'auto' }}>
            {statusInfo.text}
          </Tag>
        </div>
      }
      placement="right"
      width={520}
      onClose={onClose}
      open={visible}
    >
      <div className="booking-detail">
        {/* Thông tin đặt khám */}
        <div className="detail-section">
          <Title level={5} className="section-title">
            <FileTextOutlined /> Thông tin đặt khám
          </Title>

          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã đặt khám">
              <Text strong>{booking.bookingId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày khám">
              <CalendarOutlined /> {booking.bookingDate}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian khám">
              <ClockCircleOutlined /> {booking.appointmentTime}
            </Descriptions.Item>
            {booking.workDate && (
              <Descriptions.Item label="Ngày làm việc của bác sĩ">
                <CalendarOutlined /> {booking.workDate}
              </Descriptions.Item>
            )}
            {booking.startTime && booking.endTime && (
              <Descriptions.Item label="Khung giờ làm việc">
                <ClockCircleOutlined /> {booking.startTime} - {booking.endTime}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Phí dịch vụ">
              <DollarOutlined /> {booking.fee?.toLocaleString() || 0} VNĐ
            </Descriptions.Item>
            <Descriptions.Item label="Số thứ tự">
              <BookOutlined /> #{booking.appointmentNumber || 0}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* Thông tin y tế */}
        <div className="detail-section">
          <Title level={5} className="section-title">
            <HomeOutlined /> Thông tin khám bệnh
          </Title>

          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Cơ sở y tế">
              <Text strong>{booking.hospital || 'Chưa có thông tin'}</Text>
            </Descriptions.Item>
            {booking.hospitalAddress && (
              <Descriptions.Item label="Địa chỉ bệnh viện">
                <Text>{booking.hospitalAddress}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Dịch vụ khám">
              <Text strong>{booking.serviceName || 'Chưa có thông tin'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Chuyên khoa">
              <Text>{booking.department || 'Chưa có thông tin'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ">
              <Text strong>{booking.doctor || 'Chưa có thông tin'}</Text>
            </Descriptions.Item>
            {booking.doctorDescription && booking.doctorDescription !== booking.doctor && (
              <Descriptions.Item label="Thông tin bác sĩ">
                <Text>{booking.doctorDescription}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Phòng khám">
              <Text>{booking.room || 'Chưa có thông tin'}</Text>
            </Descriptions.Item>
            {booking.roomCode && booking.roomCode !== booking.room && (
              <Descriptions.Item label="Mã phòng">
                <Text>{booking.roomCode}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Triệu chứng/Lý do khám">
              <Text>{booking.symptoms || 'Không có mô tả triệu chứng'}</Text>
            </Descriptions.Item>
            {booking.notes && (
              <Descriptions.Item label="Ghi chú">
                <Text>{booking.notes}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>

        {/* Thông tin lịch làm việc */}
        {(booking.workDate || booking.startTime || booking.endTime) && (
          <>
            <Divider />
            <div className="detail-section">
              <Title level={5} className="section-title">
                <ClockCircleOutlined /> Lịch làm việc bác sĩ
              </Title>

              <Descriptions column={1} bordered size="small">
                {booking.workDate && (
                  <Descriptions.Item label="Ngày làm việc">
                    <CalendarOutlined /> {booking.workDate}
                  </Descriptions.Item>
                )}
                {booking.startTime && booking.endTime && (
                  <Descriptions.Item label="Khung giờ">
                    <ClockCircleOutlined /> {booking.startTime} - {booking.endTime}
                  </Descriptions.Item>
                )}
                {booking.originalData?.doctorSchedule?.isAvailable !== undefined && (
                  <Descriptions.Item label="Trạng thái lịch">
                    <Tag color={booking.originalData.doctorSchedule.isAvailable ? 'green' : 'red'}>
                      {booking.originalData.doctorSchedule.isAvailable ? 'Có sẵn' : 'Không có sẵn'}
                    </Tag>
                  </Descriptions.Item>
                )}
                {booking.originalData?.doctorSchedule?.reasonOfUnavailability && (
                  <Descriptions.Item label="Lý do không có sẵn">
                    <Text>{booking.originalData.doctorSchedule.reasonOfUnavailability}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          </>
        )}

        <Divider />

        {/* Thông tin bệnh nhân */}
        <div className="detail-section">
          <Title level={5} className="section-title">
            <UserOutlined /> Thông tin bệnh nhân
          </Title>

          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Họ và tên">
              <Text strong>{booking.patientName || 'Chưa có thông tin'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <PhoneOutlined /> {booking.patientPhone || 'Chưa có thông tin'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <MailOutlined /> {booking.patientEmail || 'Chưa có thông tin'}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* ✅ Debug info in development */}
       

        <Divider />

        {/* Action buttons */}
        <Row gutter={16} justify="end">
          {booking.status === 'pending' && (
            <Col>
              <Button
                type="primary"
                danger
                onClick={handleCancelAppointment}
              >
                Hủy lịch hẹn
              </Button>
            </Col>
          )}
          {booking.status === 'completed' && (
            <Col>
              <Button
                type="primary"
                onClick={handleViewMedicalRecord}
              >
                Xem phiếu khám
              </Button>
            </Col>
          )}
          <Col>
            <Button onClick={onClose}>
              Đóng
            </Button>
          </Col>
        </Row>
      </div>
    </Drawer>
  );
};

export default BookingDetailDrawer;