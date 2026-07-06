import { Paragraph } from '../types';

export const PARAGRAPHS: Paragraph[] = [
  // --- MONGOLIAN PARAGRAPHS ('mn') ---
  {
    id: 'easy-1',
    text: 'Эрүүл биед саруул ухаан оршино.',
    source: 'Эртний сургаал үг',
    difficulty: 'easy',
    lang: 'mn'
  },
  {
    id: 'easy-2',
    text: 'Ажил хийвэл ам тосдоно, ажилгүй бол хоосон хононо.',
    source: 'Монгол ардын зүйр үг',
    difficulty: 'easy',
    lang: 'mn'
  },
  {
    id: 'easy-3',
    text: 'Эрдэм сурахыг залуугаас нь, эмнэг сургахыг дааганаас нь.',
    source: 'Ардын зүйр үг',
    difficulty: 'easy',
    lang: 'mn'
  },
  {
    id: 'easy-4',
    text: 'Эх орныхоо байгаль дэлхийг хайрлан хамгаалах нь иргэн бүрийн журамт үүрэг мөн.',
    source: 'Монгол Улсын Үндсэн хууль',
    difficulty: 'easy',
    lang: 'mn'
  },
  {
    id: 'medium-1',
    text: 'Ном бол ертөнцийг харах цонх мөн. Ном унших бүрд хүний мэдлэг тэлж, оюун ухаан хөгжиж, илүү уудам сэтгэх, амжилтад хүрэх боломжийг олгодог билээ.',
    source: 'Оюуны сургаал',
    difficulty: 'medium',
    lang: 'mn'
  },
  {
    id: 'medium-2',
    text: 'Цаг хугацаа бол алт гэдэг. Өнгөрсөн цаг мөчийг хэзээ ч буцааж авч чадахгүй тул секунд бүрийг үр дүнтэй, утга учиртай өнгөрүүлж, өөрийгөө байнга хөгжүүлээрэй.',
    source: 'Цаг хугацааны сургаал',
    difficulty: 'medium',
    lang: 'mn'
  },
  {
    id: 'medium-3',
    text: 'Бэрхшээл бүрийн цаана боломж нуугдаж байдаг. Тулгарсан асуудалд шантралгүй, ухаалаг хандаж, шийдлийг олохыг хичээх нь амжилттай амьдралын чухал түлхүүр юм.',
    source: 'Амжилтын нууц',
    difficulty: 'medium',
    lang: 'mn'
  },
  {
    id: 'medium-4',
    text: 'Хүн хэлээрээ, мал хөлөөрөө гэж монголчууд ярьдаг. Бусадтай зөв боловсон харилцаж, үг хэлээ цэгцтэй, найрсаг байлгах нь харилцан итгэлцэл, уур амьсгалыг бий болгодог.',
    source: 'Монгол зан заншил',
    difficulty: 'medium',
    lang: 'mn'
  },
  {
    id: 'hard-1',
    text: 'Монгол Улс бол уудам уушиг шиг дэлгэр сайхан нутагтай, эртний баялаг түүхтэй улс билээ. Бидний өвөг дээдэс нүүдэлчин соёл, уламжлалт зан заншил, эв нэгдлийг эрхэмлэн дээдэлж, дэлхий дахинд өөрсдийн нэр алдрыг мөнхөлж чадсан түүхтэй юм.',
    source: 'Түүхийн хуудас',
    difficulty: 'hard',
    lang: 'mn'
  },
  {
    id: 'hard-2',
    text: 'Хүн төрөлхтний хөгжил дэвшил технологиян шинэ эрин үед маш хурдтай хувьсан өөрчлөгдөж байна. Энэхүү хурдтай нийлүүлэн алхахын тулд бид тасралтгүй суралцаж, шинэ мэдлэг, ур чадварыг эзэмшихээс гадина өөрийнхөө дотоод сэтгэлгээг ч тэлж байх шаардлагатай билээ.',
    source: 'Технологийн хөгжил',
    difficulty: 'hard',
    lang: 'mn'
  },
  {
    id: 'hard-3',
    text: 'Монгол гэдэг нэрийг сонсоход уудам тал нутаг, цэлмэг хөх тэнгэр, хурдан морины төвөргөөн, айрагны амт сэтгэлд буудаг. Энэхүү гайхамшигт өв соёлоо хадгалан хамгаалж, дэлхийн соёл соёл иргэншилтэй хөл нийлүүлэн хөгжүүлэх нь залуу үеийн бидний эрхэм үүрэг юм.',
    source: 'Соёлын өв соёл',
    difficulty: 'hard',
    lang: 'mn'
  },

  // --- ENGLISH PARAGRAPHS ('en') ---
  {
    id: 'en-easy-1',
    text: 'The quick brown fox jumps over the lazy dog.',
    source: 'Pangram Classic',
    difficulty: 'easy',
    lang: 'en'
  },
  {
    id: 'en-easy-2',
    text: 'Practice makes perfect. Keep training your fingers every single day!',
    source: 'Traditional Maxim',
    difficulty: 'easy',
    lang: 'en'
  },
  {
    id: 'en-easy-3',
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    source: 'Winston Churchill',
    difficulty: 'easy',
    lang: 'en'
  },
  {
    id: 'en-easy-4',
    text: 'Your time is limited, so do not waste it living someone else life.',
    source: 'Steve Jobs',
    difficulty: 'easy',
    lang: 'en'
  },
  {
    id: 'en-medium-1',
    text: 'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.',
    source: 'Ralph Waldo Emerson',
    difficulty: 'medium',
    lang: 'en'
  },
  {
    id: 'en-medium-2',
    text: 'The only way to do great work is to love what you do. If you have not found it yet, keep looking. Do not settle.',
    source: 'Steve Jobs',
    difficulty: 'medium',
    lang: 'en'
  },
  {
    id: 'en-medium-3',
    text: 'In the middle of every difficulty lies opportunity. Keep typing, keep focus, and master the keyboard layout with confidence.',
    source: 'Albert Einstein',
    difficulty: 'medium',
    lang: 'en'
  },
  {
    id: 'en-medium-4',
    text: 'Do not go where the path may lead, go instead where there is no path and leave a trail for others to follow.',
    source: 'Ralph Waldo Emerson',
    difficulty: 'medium',
    lang: 'en'
  },
  {
    id: 'en-hard-1',
    text: 'The advancement of artificial intelligence and deep neural networks is revolutionizing the human experience. To keep pace with this unprecedented technological transformation, continuous adaptation and acquisition of digital skills is paramount.',
    source: 'Tech Futurology Journal',
    difficulty: 'hard',
    lang: 'en'
  },
  {
    id: 'en-hard-2',
    text: 'Beautiful writing and fluent typography are the cornerstones of exceptional digital design. When text structure matches elegant visual rhythm, readers interact with enhanced concentration, leading to superb comprehension and deeper cognitive retention.',
    source: 'Aesthetics of Web Interfaces',
    difficulty: 'hard',
    lang: 'en'
  },
  {
    id: 'en-hard-3',
    text: 'The astronomical complexity of biological ecosystems demonstrates the intricate equilibrium maintained by countless organisms. Understanding these symbiotic relationships is essential for securing ecological stability amid anthropocentric climate alterations.',
    source: 'Ecological Sciences Institute',
    difficulty: 'hard',
    lang: 'en'
  }
];
