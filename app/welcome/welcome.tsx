import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
  return (
    <div className="">
      <style>{`
        @keyframes colorShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .rainbow-hover {
          position: relative;
          transition: all 0.3s ease;
        }
        .rainbow-hover:hover {
          border-image: linear-gradient(90deg, #00ff00, #32cd32, #228b22, #006400, #00ff7f, #00fa9a, #90ee90, #00ff00) 1;
          border-image-slice: 1;
          animation: colorShift 3s ease infinite;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        }
        .rainbow-hover:hover * {
          background: linear-gradient(90deg, #00ff00, #32cd32, #228b22, #006400, #00ff7f, #00fa9a, #90ee90, #00ff00);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: colorShift 3s ease infinite;
        }
        .rainbow-hover:hover img {
          -webkit-background-clip: unset;
          -webkit-text-fill-color: unset;
          background-clip: unset;
          animation: none;
        }
      `}</style>
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12"
        style={{
          backgroundImage: "url('/bg_main.jpg')"
        }}
      >
        <div className="text-center max-w-4xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg mb-4 sm:mb-6">
            Добро пожаловать в <br className="hidden sm:block" /> автосалон Silver car
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white drop-shadow-md mb-6 sm:mb-8">
            У нас широкий выбор автомобилей <br className="hidden sm:block" /> германского, американского, японского и <br className="hidden sm:block" /> китайского производства
          </p>
        </div>
      </div>

      <div className="text-center" id="text_main">
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white drop-shadow-md leading-relaxed max-w-3xl mx-auto m-[20px] font-bold">
            Все автомобили из нашего каталога имеют <br className="hidden md:block" /> идеальное техническое состояние и готовы к <br className="hidden md:block" /> эксплуатации. При постановке автомобиля на <br className="hidden md:block" /> комиссию наши специалисты возьмут на себя <br className="hidden md:block" /> все юридические и технические нюансы, <br className="hidden md:block" /> связанные с продажей вашей машины.
          </p>
      </div>

      <div id="car_galer" className="w-full overflow-hidden">
        <img src="/car_galer.jpg" alt="" className="w-full h-auto object-cover" />
      </div>

      <div className="flex flex-col md:flex-row justify-around items-center gap-6 md:gap-8 lg:gap-12 min-h-[500px] md:h-[500px] p-4 sm:p-6 md:p-8">
          <a href="/cars" className="border bg-[#0A0A0A] p-4 sm:p-5 md:p-[20px] rainbow-hover w-full md:w-auto max-w-md">
            <img src="/check_auto.jpg" alt="" className="w-full h-auto mb-3 sm:mb-4"/>
            <p className="text-xs sm:text-sm md:text-[13px] mb-3 sm:mb-4">Посмотреть авто в наличии</p>
            <p className="text-[10px] sm:text-xs md:text-[11px] mt-4 sm:mt-5 md:mt-[20px] leading-relaxed">
              На сайте компании $ilver car вы найдете <br className="hidden sm:block" />
              каталог престижных автомобилей. Вы <br className="hidden sm:block" />
              легко сделаете заявку на авто. Выбирайте <br className="hidden sm:block" />
              автомобиль, смотрите технические <br className="hidden sm:block" />характеристики. <br className="hidden sm:block" /> Мы также всегда рады <br className="hidden sm:block" />
              видеть вас в нашем салоне, <br className="hidden sm:block" />
              где все автомобили представлены в одном месте.
            </p>
          </a>
        

          <div className="flex flex-col gap-8 sm:gap-12 md:gap-16 lg:gap-[100px] w-full md:w-auto max-w-md md:max-w-none">
            <div className="text-center md:text-left">
              <p className="text-xs sm:text-sm md:text-base leading-relaxed">
                Все автомобили из нашего каталога <br className="hidden sm:block" />
                имеют идеальное техническое состояние <br className="hidden sm:block" />
                и готовы к эксплуатации. При постановке <br className="hidden sm:block" />
                автомобиля на комиссию наши специалисты <br className="hidden sm:block" />
                возьмут на себя все юридические и <br className="hidden sm:block" />
                технические нюансы, связанные с продажей <br className="hidden sm:block" />
                машины.
              </p>
            </div>

            
            <a href="/cars" className="border rounded-[15px] p-4 sm:p-5 md:p-[25px] text-center rainbow-hover text-xs sm:text-sm md:text-base">
              Посмотреть каталог авто
            </a>
          </div>

      </div>
    </div>
  );
}
