import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seed başlatılıyor...')

  // Şifreler için hash oluştur
  const passwordHash = await bcrypt.hash('Demo123!', 10)
  const now = new Date()

  // 1. Super Admin Kullanıcıyı Oluştur (Tenant bağımsız)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@hiipota.com' },
    update: {},
    create: {
      email: 'superadmin@hiipota.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      passwordVerifiedAt: now,
    },
  })
  console.log('Super Admin oluşturuldu:', superAdmin.email)

  // 2. Demo KVKK Dokümanı Oluştur
  const kvkkDoc = await prisma.consentDocument.create({
    data: {
      title: 'Çalışan Aydınlatma Metni ve KVKK Onayı',
      content: 'Bu bir demo KVKK metnidir. Çalışan verilerinin işlenmesi şartlarını içerir.',
      version: '1.0',
      isRequired: true,
    },
  })
  console.log('KVKK Dokümanı oluşturuldu')

  // 3. Şirketler (Tenants) ve içlerindeki personeller/adminler
  const companies = [
    { name: 'Demo A.Ş.', slug: 'demo', employeeCount: 15 },
    { name: 'Akdeniz Bilişim', slug: 'akdeniz', employeeCount: 12 },
    { name: 'Boğaziçi Lojistik', slug: 'bogazici', employeeCount: 20 },
    { name: 'Alp İnşaat', slug: 'alp', employeeCount: 25 },
    { name: 'Nova Teknoloji', slug: 'nova', employeeCount: 30 },
  ]

  const departments = ['Yazılım', 'İnsan Kaynakları', 'Pazarlama', 'Satış', 'Müşteri Hizmetleri']
  const titles = ['Uzman', 'Müdür', 'Asistan', 'Direktör', 'Lider']

  for (const cmp of companies) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: cmp.slug },
      update: {},
      create: {
        name: cmp.name,
        slug: cmp.slug,
        maxEmployees: 50,
      },
    })
    console.log(`\nŞirket oluşturuldu: ${tenant.name}`)

    // Her firma için Company Admin
    await prisma.user.upsert({
      where: { email: `admin@${cmp.slug}.com` },
      update: {},
      create: {
        email: `admin@${cmp.slug}.com`,
        passwordHash,
        role: 'COMPANY_ADMIN',
        tenantId: tenant.id,
        passwordVerifiedAt: now,
      },
    })
    console.log(`Admin oluşturuldu: admin@${cmp.slug}.com`)

    // Her firma için Personeller (Employee)
    for (let i = 1; i <= cmp.employeeCount; i++) {
      const email = `personel${i}@${cmp.slug}.com`
      const dept = departments[Math.floor(Math.random() * departments.length)]
      const title = titles[Math.floor(Math.random() * titles.length)]
      
      const emp = await prisma.employee.create({
        data: {
          tenantId: tenant.id,
          firstName: `Personel`,
          lastName: `${i}`,
          email: email,
          department: dept,
          title: title,
          phone: `555000${i.toString().padStart(4, '0')}`,
        },
      })

      // Her Personel aynı zamanda giriş yapabilmesi için User olarak da eklenebilir. (Opsiyonel ama mantıklı)
      await prisma.user.upsert({
         where: { email: email },
         update: {},
         create: {
            email: email,
            passwordHash,
            role: 'EMPLOYEE',
            tenantId: tenant.id,
            passwordVerifiedAt: now,
         }
      })
    }
    console.log(`${tenant.name} için ${cmp.employeeCount} personel oluşturuldu.`)
  }

  console.log('\nSeed başarıyla tamamlandı!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
