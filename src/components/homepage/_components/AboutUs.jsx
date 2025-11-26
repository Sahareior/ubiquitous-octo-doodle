import React, { useEffect } from 'react';
import { 
  TeamOutlined, 
  RocketOutlined, 
  TrophyOutlined, 
  HeartOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Card, Row, Col, Avatar, Divider } from 'antd';
import { Linkedin, Twitter, Instagram } from 'lucide-react';
import { FaLeaf, FaHandshake, FaCouch } from 'react-icons/fa';
import { RiRocket2Fill, RiTeamFill } from 'react-icons/ri';
import { BiHeart, BiTrophy } from 'react-icons/bi';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  // Team members data
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=female&random=0',
      bio: '15+ years in furniture design and sustainable home solutions.',
      social: {
        linkedin: '#',
        instagram: '#'
      }
    },
    {
      name: 'Michael Chen',
      role: 'Head Designer',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=male&random=1',
      bio: 'Award-winning furniture designer with passion for ergonomic living.',
      social: {
        linkedin: '#',
        instagram: '#'
      }
    },
    {
      name: 'Emma Rodriguez',
      role: 'Quality Manager',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=female&random=2',
      bio: 'Ensuring every piece meets our highest standards of craftsmanship.',
      social: {
        linkedin: '#',
        instagram: '#'
      }
    },
    {
      name: 'David Kim',
      role: 'Customer Experience',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=male&random=3',
      bio: 'Dedicated to creating seamless shopping experiences for your home.',
      social: {
        linkedin: '#',
        instagram: '#'
      }
    }
  ];

  // Company values
  const values = [
    {
      icon: <FaLeaf />,
      title: 'Sustainability',
      description: 'We source eco-friendly materials and practice responsible manufacturing for a greener future.'
    },
    {
      icon: <FaCouch />,
      title: 'Quality Craftsmanship',
      description: 'Every piece is meticulously crafted for durability, comfort, and timeless beauty.'
    },
    {
      icon: <BiHeart />,
      title: 'Home Love',
      description: 'We believe your home should be your sanctuary, filled with pieces that tell your story.'
    },
    {
      icon: <FaHandshake />,
      title: 'Trust & Transparency',
      description: 'Honest pricing, clear processes, and reliable service you can count on.'
    }
  ];

  // Special features
  const features = [
    {
      icon: <EnvironmentOutlined />,
      title: 'Eco-Friendly Materials',
      description: 'Sustainably sourced wood, natural fabrics, and non-toxic finishes'
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: 'Quality Guarantee',
      description: '10-year warranty on all furniture with lifetime customer support'
    },
    {
      icon: <TeamOutlined />,
      title: 'Expert Craftsmanship',
      description: 'Skilled artisans with decades of combined experience'
    },
    {
      icon: <RocketOutlined />,
      title: 'Nationwide Delivery',
      description: 'White-glove delivery and professional assembly service'
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F4EF]">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B7355] to-[#A67B5B] text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Wiroko</h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed">
            Where timeless craftsmanship meets modern living. We create beautiful, sustainable furniture 
            that transforms houses into homes filled with comfort and style.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 container mx-auto px-4">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} lg={12}>
            <h2 className="text-3xl font-bold mb-6 text-[#6D4C41]">Our Story</h2>
            <p className="text-lg text-[#5D4037] mb-4 leading-relaxed">
             Wiroko began as a small workshop dedicated to reviving the art of 
              traditional furniture making. What started as a passion for creating heirloom-quality 
              pieces has grown into a brand synonymous with sustainable luxury and exceptional design.
            </p>
            <p className="text-lg text-[#5D4037] mb-4 leading-relaxed">
              Our name "Wiroko" draws inspiration from ancient words meaning "warmth" and "shelter" - 
              embodying our mission to create furniture that brings comfort and character to every home.
            </p>
            <p className="text-lg text-[#5D4037] leading-relaxed">
              Today, we continue to blend time-honored techniques with contemporary design, ensuring 
              each piece not only enhances your space but also respects our planet for generations to come.
            </p>
          </Col>
          <Col xs={24} lg={12}>
            <div className="bg-[#EFEBE9] rounded-lg p-8 h-full flex items-center justify-around">
              <div className="text-center">
                <div className="text-5xl font-bold text-[#795548] mb-2">6+</div>
                <div className="text-lg text-[#6D4C41]">Years of Excellence</div>
              </div>
              <Divider type="vertical" className="h-16 mx-6 bg-[#BCAAA4]" />
              <div className="text-center">
                <div className="text-5xl font-bold text-[#795548] mb-2">25K+</div>
                <div className="text-lg text-[#6D4C41]">Happy Homes</div>
              </div>
              <Divider type="vertical" className="h-16 mx-6 bg-[#BCAAA4]" />
              <div className="text-center">
                <div className="text-5xl font-bold text-[#795548] mb-2">100%</div>
                <div className="text-lg text-[#6D4C41]">Satisfaction Guarantee</div>
              </div>
            </div>
          </Col>
        </Row>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#F5F1EC]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#6D4C41]">Why Choose Wiroko</h2>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="text-center h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-[#F8F4EF]">
                  <div className="text-3xl text-[#8D6E63] mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#5D4037]">{feature.title}</h3>
                  <p className="text-[#795548] text-sm">{feature.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-[#F8F4EF]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#6D4C41]">Our Values</h2>
          <Row gutter={[32, 32]}>
            {values.map((value, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="text-center h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white border-t-4 border-[#8B7355]">
                  <div className="text-4xl text-[#8D6E63] mb-4 flex justify-center">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#5D4037]">{value.title}</h3>
                  <p className="text-[#795548] text-sm">{value.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Team Section */}


      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#8B7355] to-[#A67B5B] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Wiroko Family</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Interested in partnering with us or joining our team of passionate craftspeople?
          </p>
          <Link to='/vendorpage'>
            <button className="bg-white text-[#795548] font-semibold py-3 px-8 rounded-lg hover:bg-[#F8F4EF] transition-colors duration-300 shadow-sm hover:shadow-md">
              Become a Vendor Partner
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;