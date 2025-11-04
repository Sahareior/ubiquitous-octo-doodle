import React, { useEffect } from 'react';
import { 
  TeamOutlined, 
  RocketOutlined, 
  TrophyOutlined, 
  HeartOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  GithubOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Card, Row, Col, Avatar, Divider } from 'antd';
import { FaLinkedin } from 'react-icons/fa';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { FaTeamspeak } from 'react-icons/fa6';
import { RiRocket2Fill } from 'react-icons/ri';
import { BiHeart, BiTrophy } from 'react-icons/bi';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  // Team members data
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=female&random=0',
      bio: '10+ years of industry experience with a passion for innovation.',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      name: 'Michael Chen',
      role: 'Lead Developer',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=male&random=1',
      bio: 'Full-stack developer specializing in React and Node.js.',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      name: 'Emma Rodriguez',
      role: 'Product Designer',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=female&random=2',
      bio: 'Creating beautiful and functional user experiences for 5+ years.',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      name: 'David Kim',
      role: 'Marketing Director',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=male&random=3',
      bio: 'Expert in growth strategies and brand development.',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    }
  ];

  // Company values
  const values = [
    {
      icon: <FaTeamspeak />,
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and open communication to achieve extraordinary results.'
    },
    {
      icon: <RiRocket2Fill />,
      title: 'Innovation',
      description: 'We constantly push boundaries and explore new possibilities to stay ahead of the curve.'
    },
    {
      icon: <BiTrophy />,
      title: 'Excellence',
      description: 'We strive for the highest quality in everything we do, from product to customer service.'
    },
    {
      icon: <BiHeart />,
      title: 'Passion',
      description: 'We love what we do and are committed to making a positive impact through our work.'
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F4EF]">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-[#A67B5B] to-[#C8AD8D] text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Our Company</h1>
          <p className="text-xl max-w-3xl mx-auto">
            We are a team of passionate individuals dedicated to creating innovative solutions that make a difference.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 container mx-auto px-4">
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={12}>
            <h2 className="text-3xl font-bold mb-6 text-[#6D4C41]">Our Story</h2>
            <p className="text-lg text-[#5D4037] mb-4">
              Founded in 2015, our company began as a small startup with a big vision: to transform the way businesses 
              leverage technology for growth. What started as a team of three working out of a garage has now grown into 
              a thriving organization with over 50 employees.
            </p>
            <p className="text-lg text-[#5D4037] mb-4">
              Over the years, we've helped hundreds of clients achieve their goals through our innovative solutions and 
              dedicated support. Our journey hasn't always been easy, but our commitment to excellence and customer 
              satisfaction has remained constant.
            </p>
            <p className="text-lg text-[#5D4037]">
              Today, we continue to evolve and adapt to the changing technological landscape, always looking for new 
              ways to deliver value to our clients and make a positive impact in our industry.
            </p>
          </Col>
          <Col xs={24} lg={12}>
            <div className="bg-[#EFEBE9] rounded-lg p-6 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-[#795548] mb-2">50+</div>
                <div className="text-xl text-[#6D4C41]">Team Members</div>
              </div>
              <Divider type="vertical" className="h-20 mx-8 bg-[#BCAAA4]" />
              <div className="text-center">
                <div className="text-6xl font-bold text-[#795548] mb-2">300+</div>
                <div className="text-xl text-[#6D4C41]">Happy Clients</div>
              </div>
            </div>
          </Col>
        </Row>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-[#F5F1EC]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#6D4C41]">Our Values</h2>
          <Row gutter={[32, 32]}>
            {values.map((value, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="text-center h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-[#F8F4EF] border-t-4 border-[#A67B5B]">
                  <div className="text-4xl text-[#8D6E63] mb-4 flex justify-center">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#5D4037]">{value.title}</h3>
                  <p className="text-[#795548]">{value.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-[#F8F4EF]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#6D4C41]">Meet Our Team</h2>
          <Row gutter={[32, 32]}>
            {teamMembers.map((member, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  className="text-center h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-[#F5F1EC]"
                  cover={
                    <div className="pt-6">
                      <Avatar 
                        size={100} 
                        src={member.avatar} 
                        icon={<UserOutlined />}
                        className="border-2 border-[#D7CCC8]"
                      />
                    </div>
                  }
                >
                  <Card.Meta
                    title={<span className="text-[#5D4037]">{member.name}</span>}
                    description={<span className="text-[#8D6E63]">{member.role}</span>}
                    className="mb-3"
                  />
                  <p className="text-[#795548] text-sm mb-4">{member.bio}</p>
                  <div className="flex text-[#795548] justify-center space-x-4">
                    <a href={member.social.linkedin} className="text-[#8D6E63] hover:text-[#5D4037] text-lg">
                     <Linkedin />
                    </a>
                    <a href={member.social.twitter} className="text-[#8D6E63] hover:text-[#5D4037] text-lg">
                      <Twitter />
                    </a>
                   
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#A67B5B] to-[#C8AD8D] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Want to work with us?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            We're always looking for talented individuals to join our growing team.
          </p>
          <Link to='/vendorpage'>
          <button className="bg-white text-[#795548] font-semibold py-3 px-8 rounded-lg hover:bg-[#F8F4EF] transition-colors duration-300 shadow-sm hover:shadow-md">
            View Open Positions as Vendor
          </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;