const hre = require("hardhat");

const tokens = (n) => {
  return hre.ethers.parseUnits(n.toString(), "ether");
};


async function main() {
  // Setup accounts & variables
  const [deployer] = await ethers.getSigners();
  const NAME = "SubChain";
  const SYMBOL = "TM";

  // Deploy contract
  const SubChain = await ethers.getContractFactory("SubChain");
  const subChain = await SubChain.deploy(NAME, SYMBOL);
  await subChain.waitForDeployment();

  console.log(`Deployed SubChain Contract at: ${subChain.target}\n`);
  
  // List 6 events
  const occasions = [
    {
      name: "UFC Miami",
      cost: tokens(3),
      tickets: 0,
      date: "May 31",
      time: "6:00PM EST",
      location: "Miami-Dade Arena - Miami, FL",
    },
    {
      name: "ETH Tokyo",
      cost: tokens(1),
      tickets: 125,
      date: "Jun 2",
      time: "1:00PM JST",
      location: "Tokyo, Japan",
    },
    {
      name: "ETH Privacy Hackathon",
      cost: tokens(0.25),
      tickets: 200,
      date: "Jun 9",
      time: "10:00AM TRT",
      location: "Turkey, Istanbul",
    },
    {
      name: "Dallas Mavericks vs. San Antonio Spurs",
      cost: tokens(5),
      tickets: 0,
      date: "Jun 11",
      time: "2:30PM CST",
      location: "American Airlines Center - Dallas, TX",
    },
    {
      name: "ETH Global Toronto",
      cost: tokens(1.5),
      tickets: 125,
      date: "Jun 23",
      time: "11:00AM EST",
      location: "Toronto, Canada",
    },
  ];

  for (var i = 0; i < 5; i++) {
    const transaction = await subChain
      .connect(deployer)
      .list(
        occasions[i].name,
        occasions[i].cost,
        occasions[i].tickets,
        occasions[i].date,
        occasions[i].time,
        occasions[i].location
      );

    await transaction.wait();

    console.log(`Listed Event ${i + 1}: ${occasions[i].name}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
