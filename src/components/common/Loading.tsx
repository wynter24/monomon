import Image from 'next/image';

type LoadingProps = {
  text: string;
};

export default function Loading({ text }: LoadingProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 sm:gap-8">
      <div className="flex flex-col items-center">
        <Image
          width={70}
          height={70}
          className="sm:h-20 sm:w-20"
          src={'/images/loading_icon.png'}
          alt="loading"
        />
        <div className="mt-4 flex space-x-3 sm:mt-5 md:mt-6">
          <div className="bg-yellow h-2 w-2 animate-bounce rounded-full sm:h-2.5 sm:w-2.5 md:h-3 md:w-3"></div>
          <div
            className="bg-yellow h-2 w-2 animate-bounce rounded-full sm:h-2.5 sm:w-2.5 md:h-3 md:w-3"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="bg-yellow h-2 w-2 animate-bounce rounded-full sm:h-2.5 sm:w-2.5 md:h-3 md:w-3"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
      <p className="text-lg sm:text-xl md:text-2xl">{text}</p>
    </div>
  );
}
