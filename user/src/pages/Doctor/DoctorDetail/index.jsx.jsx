import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Avatar,
  Typography,
  List,
  Tag,
  Space,
  Button,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import { getDoctorDetail } from "../../../services/doctorService";
import imgErrorDoctor from "../../../assets/images/errorImgHospital.jpg";

const { Title, Text, Paragraph } = Typography;

export default function DoctorDetailPage() {
  const { doctorId } = useParams();
  const [doctorDetail, setDoctorDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDoctorData() {
      try {
        const response = await getDoctorDetail(doctorId);
        if (response) setDoctorDetail(response);
      } catch (error) {
        console.error("Failed to fetch doctor detail:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctorData();
  }, [doctorId]);

  if (loading)
    return (
      <div
        style={{
          padding: "60px 16px",
          textAlign: "center",
          color: "#1890ff",
          fontWeight: "600",
          fontSize: 18,
          minHeight: "70vh",
          backgroundColor: "#e0f7fa",
        }}
      >
        Đang tải thông tin bác sĩ...
      </div>
    );

  if (!doctorDetail)
    return (
      <div
        style={{
          padding: "60px 16px",
          textAlign: "center",
          color: "red",
          fontWeight: "600",
          fontSize: 18,
          minHeight: "70vh",
          backgroundColor: "#e0f7fa",
        }}
      >
        Không tìm thấy thông tin bác sĩ.
      </div>
    );

  const {
    user,
    description,
    practicingFrom,
    specializations,
    qualification,
    hospitalAffiliations,
  } = doctorDetail;

  const genderIcon = user.gender ? <ManOutlined /> : <WomanOutlined />;
  const dobFormatted = user.dob
    ? new Date(user.dob).toLocaleDateString("vi-VN")
    : "Chưa cập nhật";

  const cardStyle = {
    borderRadius: 16,
    padding: 24,
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  };

  const cardStyleWithHeight = {
    ...cardStyle,
    height: "100%",
  };

  return (
    <div
      style={{
        background: "#e0f7fa",
        padding: "40px 16px",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "0 12px",
        }}
      >
        <Row gutter={24} style={{ marginBottom: 32 }}>
          <Col xs={24} md={16}>
            <Card style={cardStyle}>
              <Row gutter={24} align="middle" wrap={false}>
                <Col
                  xs={24}
                  md={8}
                  style={{ textAlign: "center", marginBottom: 16 }}
                >
                  <Avatar
                    size={130}
                    src={user.avatarUrl || imgErrorDoctor}
                    icon={!user.avatarUrl && <UserOutlined />}
                    style={{
                      boxShadow: "0 5px 15px rgba(0,0,0,0.12)",
                      marginBottom: 12,
                    }}
                  />
                  <Tag
                    icon={genderIcon}
                    color={user.gender ? "#40a9ff" : "#f759ab"}
                    style={{ fontSize: 16, marginTop: 8, padding: "4px 16px" }}
                  >
                    {user.gender ? "Nam" : "Nữ"}
                  </Tag>
                </Col>

                <Col xs={24} md={16}>
                  <Title level={3} style={{ marginBottom: 16 }}>
                    {user.fullname}
                  </Title>
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ fontSize: 16, color: "#333" }}
                  >
                    <Text>
                      <MailOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                      {user.email || "Chưa cập nhật"}
                    </Text>
                    <Text>
                      <PhoneOutlined
                        style={{ marginRight: 8, color: "#1890ff" }}
                      />
                      {user.phoneNumber || "Chưa cập nhật"}
                    </Text>
                    <Text>
                      <HomeOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                      {[user.ward, user.province].filter(Boolean).join(", ") ||
                        "Chưa cập nhật"}
                    </Text>
                    <Text>
                      Ngày sinh: <Text strong>{dobFormatted}</Text>
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card title="Giới thiệu" style={cardStyleWithHeight}>
              <Paragraph style={{ fontSize: 16, color: "#444" }}>
                {description || "Chưa có thông tin giới thiệu."}
              </Paragraph>
              <Text type="secondary" style={{ fontStyle: "italic" }}>
                Hành nghề từ:{" "}
                {practicingFrom ? new Date(practicingFrom).getFullYear() : "Chưa cập nhật"}
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Chuyên khoa */}
        <Card
          title="Chuyên khoa"
          style={{ ...cardStyle, marginBottom: 28 }}
          bodyStyle={{ paddingTop: 20 }}
        >
          {specializations && specializations.length > 0 ? (
            <Row gutter={[16, 16]}>
              {specializations.map((spec) => (
                <Col xs={12} sm={8} md={6} key={spec.id}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        background: "#fff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        marginBottom: 10,
                      }}
                    >
                      <img
                        src={spec.image}
                        alt={spec.name}
                        style={{ maxWidth: "90%", maxHeight: "90%" }}
                      />
                    </div>
                    <Text strong style={{ color: "#004876" }}>
                      {spec.name}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <Text>Chưa cập nhật chuyên khoa</Text>
          )}
        </Card>

        {/* Quá trình đào tạo */}
        <Card
          title="Quá trình đào tạo"
          style={{ ...cardStyle, marginBottom: 28 }}
          bodyStyle={{ paddingTop: 10, paddingBottom: 10 }}
        >
          {qualification && qualification.length > 0 ? (
            <List
              dataSource={qualification}
              renderItem={(item, idx) => (
                <List.Item key={idx}>
                  <Text>
                    {item.qualificationName} - {item.instituteName} (
                    {item.procurementYear})
                  </Text>
                </List.Item>
              )}
            />
          ) : (
            <Text>Chưa cập nhật bằng cấp</Text>
          )}
        </Card>

        {/* Công tác tại cơ sở y tế */}
        <Card title="Công tác tại cơ sở y tế" style={cardStyle} bodyStyle={{ padding: 20 }}>
          {hospitalAffiliations && hospitalAffiliations.length > 0 ? (
            hospitalAffiliations.map((affil) => (
              <Card
                key={affil.id}
                type="inner"
                style={{
                  marginBottom: 20,
                  borderRadius: 12,
                  backgroundColor: "#fafcff",
                  border: "1px solid #e6f7ff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <Title level={5} style={{ color: "#1890ff", marginBottom: 6 }}>
                  {affil.hospital.name}
                </Title>
                <Paragraph style={{ marginBottom: 6 }}>{affil.hospital.address}</Paragraph>
                <Text>
                  <b>Phòng ban:</b> {affil.departmentName || "Chưa có thông tin"}
                </Text>
                <br />
                <Text>
                  <b>Vị trí:</b> {affil.position || "Chưa có thông tin"}
                </Text>
                <br />
                <Text>
                  <b>Hợp đồng:</b>{" "}
                  {affil.contractStart
                    ? new Date(affil.contractStart).toLocaleDateString()
                    : "Chưa cập nhật"}{" "}
                  -{" "}
                  {affil.contractEnd
                    ? new Date(affil.contractEnd).toLocaleDateString()
                    : "Chưa cập nhật"}
                </Text>
              </Card>
            ))
          ) : (
            <Text>Chưa có thông tin về cơ sở y tế công tác</Text>
          )}
        </Card>

        {/* Back button */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Button
            type="default"
            onClick={() => navigate(-1)}
            style={{
              borderRadius: 6,
              padding: "6px 20px",
              fontSize: 16,
              minWidth: 120,
            }}
          >
            ← Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}
