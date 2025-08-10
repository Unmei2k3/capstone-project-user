import React from "react";
import { Card, Typography, Row, Col, Avatar, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";
import avatar1 from "../../assets/images/avatar1.jpg";
import avatar2 from "../../assets/images/avatar2.jpg";
import avatar3 from "../../assets/images/avatar3.jpg";
import avatar4 from "../../assets/images/avatar4.jpg";
import avatar5 from "../../assets/images/avatar5.jpg";
const { Title, Paragraph, Text } = Typography;


const members = [
    { name: "Nguyễn Thành Vinh", role: "Lập trình Backend", avatar: avatar1 },
    { name: "Nguyễn Quốc Lập", role: "Lập trình Frontend", avatar: avatar2 },
    { name: "Trần Thành Đạt", role: "Lập trình Frontend", avatar: avatar3 },
    { name: "Phạm Thành Công", role: "Lập trình Backend", avatar: avatar4 },
    { name: "Nguyễn Bá Tùng", role: "Quản lý dự án & Kiểm thử", avatar: avatar5 },
];
const VisionMission = () => (
  <Card
    bordered={false}
    style={{
      backgroundColor: "#ffffff",
      borderRadius: 12,
      boxShadow: "0 3px 14px rgba(26,115,232,0.1)",
      padding: 24,
      marginBottom: 32,
    }}
  >
    <Title level={4} style={{ color: "#004876" }}>
      Tầm nhìn
    </Title>
    <Paragraph>
      Trở thành nền tảng y tế trực tuyến thân thiện, đáng tin cậy và toàn diện nhất tại Việt Nam,
      giúp kết nối bệnh nhân với các cơ sở y tế và bác sĩ một cách nhanh chóng, thuận tiện,
      thúc đẩy chăm sóc sức khỏe chủ động cho cộng đồng.
    </Paragraph>

    <Title level={4} style={{ color: "#004876", marginTop: 32 }}>
      Sứ mệnh
    </Title>
    <ul style={{ color: "#2e7d32", fontWeight: 500 }}>
      <li>
        Cung cấp giải pháp số hóa và tối ưu quy trình đặt lịch khám, giúp người dùng dễ dàng truy cập dịch vụ y tế chất lượng.
      </li>
      <li>
        Hỗ trợ người dùng tương tác thông minh thông qua trợ lý ảo AI, nâng cao trải nghiệm và sự hài lòng.
      </li>
      <li>
        Tạo điều kiện thuận lợi cho việc quản lý và vận hành hiệu quả các cơ sở y tế trong tập đoàn.
      </li>
      <li>
        Thúc đẩy văn hóa chăm sóc sức khỏe chủ động, minh bạch và tiện lợi cho tất cả người dùng.
      </li>
    </ul>
  </Card>
);
const ProjectIntroWithAboutUs = () => {
    return (
        <div
            style={{
                maxWidth: 960,
                margin: "40px auto",
                padding: "24px",
                fontFamily: "'Poppins', sans-serif",
                backgroundColor: "transparent", 

                color: "#003553",
            }}
        >

            <Title
                level={3}
                style={{ textAlign: "center", marginBottom: 24, color: "#1890ff" }}
            >
                Về chúng tôi
            </Title>

           <Paragraph
  style={{
    textAlign: "center",
    maxWidth: 700,
    margin: "0 auto 40px",
    fontWeight: 600,
    fontSize: 18,
   
    lineHeight: 1.6,
    textShadow: "0 1px 3px rgba(0,0,0,0.1)",
  }}
>
  Chúng tôi là nhóm 5 thành viên đến từ lớp SEP490_Group81, Đại học FPT. Dự án
  này là đồ án tốt nghiệp của chúng tôi, với mong muốn xây dựng một hệ
  thống đặt lịch khám bệnh trực tuyến thân thiện và hiệu quả.
</Paragraph>


            <Row gutter={[24, 24]} justify="center">
                {members.map((member, idx) => (
                    <Col xs={24} sm={12} md={8} lg={4} key={idx}>
                        <Card
                            hoverable
                            style={{
                                textAlign: "center",
                                borderRadius: 12,
                                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                                height: 300
                            }}
                            bodyStyle={{ paddingTop: 32, paddingBottom: 32 }}
                        >
                            <Avatar
                                size={80}
                                src={member.avatar && member.avatar.length > 0 ? member.avatar : null}
                                icon={!member.avatar ? <UserOutlined /> : null}
                                alt={member.name}
                                style={{ marginBottom: 16 }}
                            />
                            <Title level={5} style={{ marginBottom: 6 }}>
                                {member.name}
                            </Title>
                            <Text type="secondary">{member.role}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Title
                level={2}
                style={{ textAlign: "center", color: "#1a73e8", marginBottom: 32 }}
            >
                Giới thiệu dự án DABS Medical Booking
            </Title>

            {/* Mục tiêu dự án */}
            <Card
                bordered={false}
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 12,
                    boxShadow: "0 3px 14px rgba(26,115,232,0.1)",
                    padding: 24,
                    marginBottom: 32,
                }}
            >
                <Title level={4} style={{ color: "#004876" }}>
                    Mục tiêu dự án
                </Title>
                <Paragraph>
                    DABS Medical Booking xây dựng nền tảng web thân thiện, giúp người dùng
                    dễ dàng tìm kiếm thông tin y tế và đặt lịch khám trực tuyến thuận tiện
                    mọi lúc mọi nơi.
                </Paragraph>
                <ul style={{ color: "#2e7d32", fontWeight: 500 }}>
                    <li>
                        Hỗ trợ tương tác thông minh với trợ lý ảo AI, giúp giải đáp thắc mắc
                        nhanh chóng và hướng dẫn đặt lịch hiệu quả.
                    </li>
                    <li>
                        Số hóa và tối ưu hóa quản lý lịch làm việc bác sĩ, thông tin cơ sở y tế
                        trong tập đoàn.
                    </li>
                    <li>
                        Nâng cao trải nghiệm bệnh nhân với công cụ tìm kiếm minh bạch, nhanh
                        chóng và dễ dàng sử dụng.
                    </li>
                </ul>
            </Card>

            <Card
                bordered={false}
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 12,
                    boxShadow: "0 3px 14px rgba(26,115,232,0.1)",
                    padding: 24,
                    marginBottom: 32,
                }}
            >
                <Title level={4} style={{ color: "#004876" }}>
                    Đối tượng sử dụng
                </Title>
                <Paragraph>Dành cho bệnh nhân:</Paragraph>
                <ul style={{ fontWeight: 500 }}>
                    <li>
                        <Text strong>Bệnh nhân:</Text> Chủ động tìm kiếm bác sĩ, cơ sở khám, đặt
                        lịch nhanh chóng, tin cậy.
                    </li>

                </ul>
            </Card>
            <VisionMission />
            <Divider />

        </div>
    );
};

export default ProjectIntroWithAboutUs;
