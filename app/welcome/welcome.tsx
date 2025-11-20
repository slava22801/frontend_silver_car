import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
  return (
    <div className="">
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: "url('/bg_main.jpg')"
        }}
      >
        <h1 className="text-[32px] font-bold text-white drop-shadow-lg">Добро пожаловать в <br /> автосалон Silver car</h1>
      </div>
      {/* <img src="public/m5-f90-2017-black.png" alt="bmwm5f90"  className=""/> */}

      <div className="">
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: "url('/bg_main.jpg')"
        }}
      >
        <h1 className="text-[32px] font-bold text-white drop-shadow-lg">Добро пожаловать в <br /> автосалон Silver car</h1>
      </div>
      {/* <img src="public/m5-f90-2017-black.png" alt="bmwm5f90"  className=""/> */}
    </div>
    </div>

    
  );
}
