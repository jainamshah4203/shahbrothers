import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-serif mb-8 text-center">Return & Refund Policy</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
          <p>
            At Shah Brothers, we take pride in the quality of our premium stationery and office supplies. 
            If you are not entirely satisfied with your purchase, we're here to help.
          </p>
          
          <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">1. Returns</h2>
          <p>
            You have 7 calendar days to return an item from the date you received it.
            To be eligible for a return, your item must be unused and in the same condition that you received it.
            Your item must be in the original packaging. Your item needs to have the receipt or proof of purchase.
          </p>

          <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">2. Refunds</h2>
          <p>
            Once we receive your item, we will inspect it and notify you that we have received your returned item.
            We will immediately notify you on the status of your refund after inspecting the item.
            If your return is approved, we will initiate a refund to your credit card (or original method of payment).
            You will receive the credit within a certain amount of days, depending on your card issuer's policies.
          </p>

          <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">3. Non-Returnable Items</h2>
          <p>
            Certain items cannot be returned due to hygiene and usage constraints:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Opened ink bottles or cartridges</li>
            <li>Pens or markers that have been unsealed or used</li>
            <li>Customized or personalized stationery</li>
            <li>Gift cards</li>
          </ul>

          <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">4. Shipping</h2>
          <p>
            You will be responsible for paying for your own shipping costs for returning your item.
            Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
          </p>

          <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions on how to return your item to us, please contact us at support@shahbrothers.com or call our customer care hotline.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
