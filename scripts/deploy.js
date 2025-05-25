const hre = require("hardhat")

const tokens = (n) => {
  return hre.ethers.parseUnits(n.toString(), 'ether')
}

async function main() {
  const [deployer] = await ethers.getSigners()
  const NAME = "SubChain"
  const SYMBOL = "SUB"

  
  const SubChain = await ethers.getContractFactory("SubChain")
  const subChain = await SubChain.deploy(NAME, SYMBOL)
  const subChainAddress = await subChain.getAddress()

  console.log(`Deployed SubChain Contract at: ${subChainAddress}\n`)

  // Contoh 5 subscription plan
  const subscriptions = [
    {
      name: "Netflix Basic",
      cost: tokens(0.01),
      months: 6,
      date: "2025-06-01",
      time: "00:00",
      provider: "Netflix",
      category: "Entertainment"
    },
    {
      name: "Spotify Premium",
      cost: tokens(0.008),
      months: 12,
      date: "2025-06-01",
      time: "00:00",
      provider: "Spotify",
      category: "Entertainment"
    },
    {
      name: "AWS Developer Tier",
      cost: tokens(0.05),
      months: 3,
      date: "2025-06-01",
      time: "00:00",
      provider: "Amazon Web Services",
      category: "Cloud Service"
    },
    {
      name: "Figma Pro",
      cost: tokens(0.015),
      months: 6,
      date: "2025-06-01",
      time: "00:00",
      provider: "Figma Inc.",
      category: "Design"
    },
    {
      name: "Adobe CC",
      cost: tokens(0.09),
      months: 12,
      date: "2025-06-01",
      time: "00:00",
      provider: "Adobe",
      category: "Design"
    }
  ]

  for (let i = 0; i < subscriptions.length; i++) {
    const tx = await subChain.connect(deployer).list(
      subscriptions[i].name,
      subscriptions[i].cost,
      subscriptions[i].months,
      subscriptions[i].date,
      subscriptions[i].time,
      subscriptions[i].provider,
      subscriptions[i].category
    )
    await tx.wait()
    console.log(`Listed Subscription ${i + 1}: ${subscriptions[i].name} (Category: ${subscriptions[i].category})`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
