import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "558589891444"; // Substitua pelo número real
const DEFAULT_MESSAGE = "Olá! fiquei interessada na peça que vi no Site, pode me ajudar?";

interface WhatsAppButtonProps {
  message?: string;
  productName?: string;
}

export const getWhatsAppUrl = (message?: string, productName?: string) => {
  let finalMessage = message || DEFAULT_MESSAGE;
  if (productName) {
    finalMessage = `Olá! fiquei interessada na peça "${productName}" que vi no Site, pode me ajudar?`;
  }
  const encodedMessage = encodeURIComponent(finalMessage);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};

const WhatsAppButton = ({ message, productName }: WhatsAppButtonProps) => {
  const handleClick = () => {
    window.open(getWhatsAppUrl(message, productName), "_blank");
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.3, type: "spring" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" fill="white" />
    </motion.button>
  );
};

export default WhatsAppButton;
