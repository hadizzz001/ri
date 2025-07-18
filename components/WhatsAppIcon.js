// components/WhatsAppIcon.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons'; // Thinner icon

const WhatsAppIcon = () => {
  return (
    <a
      href="https://wa.me/+96178808100"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '5px',
        right: '10px',
        backgroundColor: '#000',
        color: '#fff',
        borderRadius: '8px',
        padding: '12px 13px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '10px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        textDecoration: 'none',
      }}
      id="wap1"
      className="uppercase"
    >
      {/* Red Dot */}
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'red',
          display: 'inline-block',
          marginRight: '6px',
        }}
      ></span>

      {/* Icon */}
      <svg
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  stroke="#fff"
  width="18"
  strokeWidth={0}
>
  <g id="SVGRepo_bgCarrier" strokeWidth={0} />
  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
  <g id="SVGRepo_iconCarrier">
    {" "}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21 6L20.25 5.25H3.75L3 6V20.5607L6.31066 17.25H20.25L21 16.5V6ZM19.5 6.75V15.75H5.68934L4.5 16.9393V6.75H19.5Z"
      fill="#fff"
    />{" "}
  </g>
</svg>


      &nbsp; Chat with an expert
    </a>
  );
};

export default WhatsAppIcon;
