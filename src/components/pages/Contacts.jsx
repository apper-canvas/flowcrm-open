import { motion } from "framer-motion";
import Layout from "@/components/organisms/Layout";
import ContactList from "@/components/organisms/ContactList";

const Contacts = () => {
  return (
    <Layout title="Contacts">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ContactList />
      </motion.div>
    </Layout>
  );
};

export default Contacts;