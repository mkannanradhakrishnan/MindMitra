import { Shell } from "@/components/shell";
import { Card, Button } from "@/components/ui";
import { PhoneCall, ShieldAlert, HeartHandshake } from "lucide-react";
const campusPhone = process.env.NEXT_PUBLIC_CAMPUS_COUNSELLING_PHONE;
export default function Crisis() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-coral p-7 text-white">
          <ShieldAlert size={30} />
          <h1 className="mt-5 text-3xl font-black">Need urgent help?</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
            If you may hurt yourself or someone else, or you are in immediate
            danger, contact emergency services or a trusted person now. This app
            cannot provide emergency care.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="tel:112">
              <Button className="border-2 border-white bg-[#10231d] text-white shadow-lg shadow-[#10231d]/20 hover:bg-[#0b1a17]">
                <PhoneCall size={16} />
                Call 112
              </Button>
            </a>
            <a href="tel:18008914416">
              <Button className="border border-white/60 bg-white/10 text-white hover:bg-white/15">
                <PhoneCall size={16} />
                Tele-MANAS 14416
              </Button>
            </a>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Card>
            <HeartHandshake className="text-sage" />
            <h2 className="mt-4 font-bold">Campus counselling</h2>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Replace these placeholders with your institution’s verified
              counselling contact, location and hours before deployment.
            </p>
            {campusPhone ? <a href={`tel:${campusPhone}`}><Button className="mt-5 w-full" variant="secondary">Call campus counsellor</Button></a> : <p className="mt-5 rounded-xl bg-cream p-3 text-xs leading-5 text-black/50">Campus contact is not configured. Ask your institution for its verified counselling number.</p>}
          </Card>
          <Card>
            <ShieldAlert className="text-coral" />
            <h2 className="mt-4 font-bold">If it can’t wait</h2>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Go to the nearest emergency department or ask someone you trust to
              stay with you.
            </p>
            <a href="tel:112"><Button className="mt-5 w-full border-2 border-[#a33a27] bg-[#10231d] text-white hover:bg-[#0b1a17]">Call emergency services</Button></a>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
