import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import headerImg from "../assets/img/header-img.svg";
import { ArrowRightCircle } from 'react-bootstrap-icons';
import 'animate.css';
import TrackVisibility from 'react-on-screen';

export const Banner = () => {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(300 - Math.random() * 100);
  const [index, setIndex] = useState(1);

  const toRotate(()=> ["Aggregator", "Summariser", "Curator"],[]);
  const period = 2000;

  useEffect(() => {
    const ticker = setInterval(() => {
      setText(prevText => {
        const i = loopNum % toRotate.length;
        const fullText = toRotate[i];
        const updatedText = isDeleting
          ? fullText.substring(0, prevText.length - 1)
          : fullText.substring(0, prevText.length + 1);

        if (isDeleting) {
          setDelta(prev => prev / 2);
        }

        if (!isDeleting && updatedText === fullText) {
          setIsDeleting(true);
          setDelta(period);
          setIndex(prev => prev - 1);
        } else if (isDeleting && updatedText === '') {
          setIsDeleting(false);
          setLoopNum(prev => prev + 1);
          setDelta(500);
          setIndex(1);
        } else {
          setIndex(prev => prev + 1);
        }

        return updatedText;
      });
    }, delta);

    return () => clearInterval(ticker);
  }, [delta, isDeleting, loopNum,toRotate]); // Proper dependency array

  return (
    <section className="banner" id="home">
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={6} xl={7}>
            <TrackVisibility>
              {({ isVisible }) =>
                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                  <h1>
                    {`Hi! I'm TextCraft, an AI News `}
                    <span className="txt-rotate" dataPeriod="1000" data-rotate='[ "Aggregator", "Summariser", "Curator" ]'>
                      <span className="wrap" data-index={index}>{text}</span>
                    </span>
                  </h1>
                  <p>
                    Discover the Future of Informed Content Consumption! Powered by cutting-edge Artificial Intelligence, TextCraft delivers tailored news summaries faster than ever. Say goodbye to information overload and hello to personalized news curation. Join us on the journey to smarter news consumption with TextCraft.
                  </p>
                  <button onClick={() => console.log('connect')}>
                    Get Started <ArrowRightCircle size={25} />
                  </button>
                </div>
              }
            </TrackVisibility>
          </Col>
          <Col xs={12} md={6} xl={5}>
            <TrackVisibility>
              {({ isVisible }) =>
                <div className={isVisible ? "animate__animated animate__zoomIn" : ""}>
                  <img src={headerImg} alt="Header Img" />
                </div>
              }
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
