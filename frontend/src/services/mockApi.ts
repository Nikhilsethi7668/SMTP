import { UserRole } from '../constants';
import type { Tenant, User, SmtpCredential, CreditBalance, CreditTransaction, Message, AuditLog, UsageData, Suppression, Domain, MessageStatus, MessageEvent, Template } from '../types';
import { faker } from '@faker-js/faker';

// --- MOCK DATABASE ---
let tenants: Tenant[] = [];
let users: User[] = [];
let smtpCredentials: SmtpCredential[] = [];
let creditBalances: CreditBalance[] = [];
let creditTransactions: CreditTransaction[] = [];
let messages: Message[] = [];
let auditLogs: AuditLog[] = [];
let suppressions: Suppression[] = [];
let domains: Domain[] = [];
let templates: Template[] = [];

const generateMessageEvents = (finalStatus: MessageStatus, creationDate: Date): MessageEvent[] => {
    const events: MessageEvent[] = [];
    const queuedTime = creationDate;
    events.push({ timestamp: queuedTime.toISOString(), status: 'queued', description: 'Message accepted and queued for delivery.' });

    if (finalStatus === 'queued') return events;

    const sentTime = faker.date.soon({ refDate: queuedTime, days: 0.01 });
    events.push({ timestamp: sentTime.toISOString(), status: 'sent', description: 'Message sent to the remote mail server.' });

    if (finalStatus === 'sent') return events;

    const finalTime = faker.date.soon({ refDate: sentTime, days: 0.02 });
     const descriptions = {
        delivered: 'The remote server accepted the message.',
        bounced: 'The remote server permanently rejected the message.',
        failed: 'An internal error prevented the message from being sent.',
    };
    events.push({ timestamp: finalTime.toISOString(), status: finalStatus, description: descriptions[finalStatus] || 'Final status event.' });
    
    return events;
}

const initializeMockData = () => {
    tenants = Array.from({ length: 5 }, (_, i) => ({
        id: `tenant_${i + 1}`,
        name: faker.company.name(),
        contactEmail: faker.internet.email(),
        createdAt: faker.date.past().toISOString(),
    }));

    users = [
        { id: 'user_superadmin', email: 'superadmin@example.com', name: 'Super Admin', role: UserRole.SUPERADMIN, isActive: true, isVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tenantId: 'tenant_1' },
        { id: 'user_admin', email: 'admin@example.com', name: 'Admin User', role: UserRole.ADMIN, isActive: true, isVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tenantId: 'tenant_1' },
        { id: 'user_user', email: 'user@example.com', name: 'Regular User', role: UserRole.USER, isActive: true, isVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tenantId: 'tenant_1' },
        { id: 'user_billing', email: 'billing@example.com', name: 'Billing Contact', role: UserRole.BILLING, isActive: true, isVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tenantId: 'tenant_1' },
        { id: `user_${faker.string.uuid()}`, email: faker.internet.email(), name: faker.person.fullName(), role: UserRole.USER, isActive: true, isVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tenantId: 'tenant_1' },
    ];
    
    tenants.forEach(tenant => {
        creditBalances.push({
            id: `cb_${tenant.id}`,
            tenantId: tenant.id,
            balance: faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }),
            currency: 'USD',
        });

        smtpCredentials.push({
            id: `smtp_${tenant.id}`,
            tenantId: tenant.id,
            username: faker.internet.username().toLowerCase(),
            apiKey: `key-${faker.string.uuid()}`,
            createdAt: faker.date.past().toISOString(),
        });
        
        messages.push(...Array.from({length: faker.number.int({min: 20, max: 50})}, () => {
            const status = faker.helpers.arrayElement<MessageStatus>(['delivered', 'sent', 'bounced', 'failed', 'queued']);
            const createdAt = faker.date.recent({days: 30});
            return {
                id: faker.string.uuid(),
                tenantId: tenant.id,
                smtpCredentialId: `smtp_${tenant.id}`,
                recipients: [{email: faker.internet.email()}],
                subject: faker.lorem.sentence(),
                status: status,
                powermtaMessageId: `pmta-${faker.string.uuid()}`,
                cost: 0.1,
                createdAt: createdAt.toISOString(),
                updatedAt: new Date().toISOString(),
                events: generateMessageEvents(status, createdAt),
            }
        }));

        suppressions.push({
            id: faker.string.uuid(),
            tenantId: tenant.id,
            email: faker.internet.email(),
            reason: 'bounce',
            createdAt: faker.date.recent({days: 10}).toISOString(),
        });
         suppressions.push({
            id: faker.string.uuid(),
            tenantId: tenant.id,
            email: faker.internet.email(),
            reason: 'complaint',
            createdAt: faker.date.recent({days: 5}).toISOString(),
        });

        domains.push({
            id: faker.string.uuid(),
            tenantId: tenant.id,
            domainName: faker.internet.domainName(),
            status: 'verified',
            spfRecord: 'v=spf1 include:mail.yourplatform.com ~all',
            dkimRecord: 'pmta._domainkey',
            dkimPublicKey: `v=DKIM1; k=rsa; p=${faker.string.alphanumeric(256)}`,
            trackingCname: `tracking.${faker.internet.domainName()}`,
            createdAt: faker.date.past().toISOString(),
        });
         domains.push({
            id: faker.string.uuid(),
            tenantId: tenant.id,
            domainName: faker.internet.domainName(),
            status: 'pending',
            spfRecord: 'v=spf1 include:mail.yourplatform.com ~all',
            dkimRecord: 'pmta._domainkey',
            dkimPublicKey: `v=DKIM1; k=rsa; p=${faker.string.alphanumeric(256)}`,
            trackingCname: `tracking.${faker.internet.domainName()}`,
            createdAt: faker.date.recent().toISOString(),
        });

        templates.push(
            {
                id: faker.string.uuid(),
                tenantId: tenant.id,
                name: "Welcome Email",
                subject: "Welcome to {{company_name}}!",
                body: "<h1>Hi {{name}},</h1><p>Thanks for joining us. We're excited to have you.</p>",
                createdAt: faker.date.past().toISOString(),
                updatedAt: faker.date.recent().toISOString(),
            },
            {
                id: faker.string.uuid(),
                tenantId: tenant.id,
                name: "Password Reset",
                subject: "Your password reset request",
                body: "<p>Someone requested a password reset for your account. If this was you, please click the link below:</p><a href='{{reset_link}}'>Reset Password</a>",
                createdAt: faker.date.past().toISOString(),
                updatedAt: faker.date.recent().toISOString(),
            }
        )
    });

};

initializeMockData();


// --- MOCK API IMPLEMENTATION ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    login: async (email: string, role: UserRole): Promise<User> => {
        await delay(500);
        const user = users.find(u => u.role === role);
        if (user) {
            return { ...user, email };
        }
        throw new Error('User not found');
    },
    getTenants: async (): Promise<Tenant[]> => {
        await delay(500);
        return tenants;
    },
    getTenantDetails: async (tenantId: string): Promise<{ tenant: Tenant, balance: CreditBalance, smtpCredentials: SmtpCredential[] }> => {
        await delay(500);
        const tenant = tenants.find(t => t.id === tenantId);
        if (!tenant) throw new Error('Tenant not found');
        const balance = creditBalances.find(b => b.tenantId === tenantId)!;
        const creds = smtpCredentials.filter(c => c.tenantId === tenantId);
        return { tenant, balance, smtpCredentials: creds };
    },
    topUpCredits: async (tenantId: string, amount: number, adminUser: User): Promise<CreditBalance> => {
        await delay(1000);
        const balance = creditBalances.find(b => b.tenantId === tenantId);
        if (!balance) throw new Error('Balance not found');
        const balanceBefore = balance.balance;
        balance.balance += amount;
        
        const transaction: CreditTransaction = {
            id: faker.string.uuid(),
            tenantId,
            amount,
            balanceBefore,
            balanceAfter: balance.balance,
            type: 'topup',
            reference: `Admin top-up by ${adminUser.name}`,
            createdByUser: adminUser.name,
            createdAt: new Date().toISOString()
        };
        creditTransactions.unshift(transaction);
        
        const log: AuditLog = {
            id: faker.string.uuid(),
            userId: adminUser.id,
            userEmail: adminUser.email,
            tenantId,
            action: 'credits.topup',
            metadata: { amount, newBalance: balance.balance },
            createdAt: new Date().toISOString()
        };
        auditLogs.unshift(log);
        
        return balance;
    },
    createSmtpCredential: async (tenantId: string, adminUser: User): Promise<SmtpCredential> => {
        await delay(700);
        const tenant = tenants.find(t => t.id === tenantId);
        if (!tenant) throw new Error('Tenant not found');

        const newCredential: SmtpCredential = {
            id: `smtp_${faker.string.uuid()}`,
            tenantId: tenantId,
            username: faker.internet.username().toLowerCase(),
            apiKey: `key-${faker.string.uuid()}`,
            createdAt: new Date().toISOString(),
        };

        smtpCredentials.push(newCredential);
        
        const log: AuditLog = {
            id: faker.string.uuid(),
            userId: adminUser.id,
            userEmail: adminUser.email,
            tenantId,
            action: 'smtp_credential.create',
            metadata: { username: newCredential.username },
            createdAt: new Date().toISOString()
        };
        auditLogs.unshift(log);

        return newCredential;
    },
    getCreditTransactions: async (tenantId: string): Promise<CreditTransaction[]> => {
        await delay(500);
        return creditTransactions.filter(t => t.tenantId === tenantId);
    },
    getMessages: async (tenantId: string, filters?: { status?: MessageStatus | '', search?: string }): Promise<Message[]> => {
        await delay(800);
        let tenantMessages = messages.filter(m => m.tenantId === tenantId);

        if (filters) {
            if (filters.status) {
                tenantMessages = tenantMessages.filter(m => m.status === filters.status);
            }
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                tenantMessages = tenantMessages.filter(m => 
                    m.subject.toLowerCase().includes(searchTerm) ||
                    m.recipients.some(r => r.email.toLowerCase().includes(searchTerm))
                );
            }
        }

        return tenantMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    sendMessage: async (tenantId: string, fromCredId: string, subject: string, recipients: string): Promise<Message> => {
        await delay(1200);

        const recipientList = recipients.split(',').map(email => email.trim().toLowerCase());
        const tenantSuppressions = suppressions.filter(s => s.tenantId === tenantId).map(s => s.email.toLowerCase());
        
        const suppressedRecipient = recipientList.find(r => tenantSuppressions.includes(r));
        if (suppressedRecipient) {
            throw new Error(`Recipient ${suppressedRecipient} is on the suppression list.`);
        }

        const balance = creditBalances.find(b => b.tenantId === tenantId);
        if (!balance || balance.balance < 0.1) {
            throw new Error('Insufficient credits');
        }
        balance.balance -= 0.1;
        
        const creationDate = new Date();
        const newMessage: Message = {
            id: faker.string.uuid(),
            tenantId: tenantId,
            smtpCredentialId: fromCredId,
            recipients: recipients.split(',').map(email => ({email: email.trim()})),
            subject,
            status: 'queued',
            powermtaMessageId: `pmta-${faker.string.uuid()}`,
            cost: 0.1,
            createdAt: creationDate.toISOString(),
            updatedAt: creationDate.toISOString(),
            events: generateMessageEvents('queued', creationDate),
        }
        messages.unshift(newMessage);
        setTimeout(() => {
            const msg = messages.find(m => m.id === newMessage.id);
            if(msg) {
                msg.status = 'sent';
                msg.events.push(...generateMessageEvents('sent', new Date(msg.createdAt)).slice(1));
            }
        }, 3000);
        return newMessage;
    },
    getUsageData: async (_tenantId: string): Promise<UsageData[]> => {
        await delay(600);
        const data: UsageData[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = faker.date.recent({days: i+1});
            date.setHours(0,0,0,0);
            data.push({
                date: date.toISOString().split('T')[0],
                sent: faker.number.int({ min: 500, max: 5000 }),
                bounced: faker.number.int({ min: 10, max: 100 }),
                failed: faker.number.int({ min: 5, max: 50 }),
            });
        }
        return data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    getAuditLogs: async (tenantId: string): Promise<AuditLog[]> => {
        await delay(700);
        return auditLogs.filter(log => log.tenantId === tenantId);
    },
    getSuppressions: async (tenantId: string): Promise<Suppression[]> => {
        await delay(500);
        return suppressions.filter(s => s.tenantId === tenantId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    addSuppression: async (tenantId: string, email: string, reason: Suppression['reason'], adminUser: User): Promise<Suppression> => {
        await delay(600);
        if (suppressions.some(s => s.tenantId === tenantId && s.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('Email is already on the suppression list.');
        }

        const newSuppression: Suppression = {
            id: faker.string.uuid(),
            tenantId,
            email,
            reason,
            createdAt: new Date().toISOString()
        };
        suppressions.unshift(newSuppression);

        const log: AuditLog = {
            id: faker.string.uuid(),
            userId: adminUser.id,
            userEmail: adminUser.email,
            tenantId,
            action: 'suppression.add',
            metadata: { email, reason },
            createdAt: new Date().toISOString()
        };
        auditLogs.unshift(log);

        return newSuppression;
    },
    getDomains: async (tenantId: string): Promise<Domain[]> => {
        await delay(500);
        return domains.filter(d => d.tenantId === tenantId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    addDomain: async (tenantId: string, domainName: string, adminUser: User): Promise<Domain> => {
        await delay(800);
        if (domains.some(d => d.tenantId === tenantId && d.domainName.toLowerCase() === domainName.toLowerCase())) {
            throw new Error('Domain is already added.');
        }

        const newDomain: Domain = {
            id: faker.string.uuid(),
            tenantId,
            domainName,
            status: 'pending',
            spfRecord: 'v=spf1 include:mail.yourplatform.com ~all',
            dkimRecord: 'pmta._domainkey',
            dkimPublicKey: `v=DKIM1; k=rsa; p=${faker.string.alphanumeric(32)}...${faker.string.alphanumeric(32)}`,
            trackingCname: `tracking.${domainName}`,
            createdAt: new Date().toISOString()
        };
        domains.unshift(newDomain);

        const log: AuditLog = {
            id: faker.string.uuid(),
            userId: adminUser.id,
            userEmail: adminUser.email,
            tenantId,
            action: 'domain.add',
            metadata: { domainName },
            createdAt: new Date().toISOString()
        };
        auditLogs.unshift(log);

        return newDomain;
    },
    verifyDomain: async (domainId: string): Promise<Domain> => {
        await delay(1500);
        const domain = domains.find(d => d.id === domainId);
        if (!domain) {
            throw new Error('Domain not found.');
        }
        // Simulate successful verification
        domain.status = 'verified';
        return domain;
    },
    getTemplates: async (tenantId: string): Promise<Template[]> => {
        await delay(500);
        return templates.filter(t => t.tenantId === tenantId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },
    saveTemplate: async (tenantId: string, templateData: Omit<Template, 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Template> => {
        await delay(800);
        if (templateData.id) { // Update
            const index = templates.findIndex(t => t.id === templateData.id && t.tenantId === tenantId);
            if (index === -1) throw new Error('Template not found');
            templates[index] = { ...templates[index], ...templateData, updatedAt: new Date().toISOString() };
            return templates[index];
        } else { // Create
            const newTemplate: Template = {
                ...templateData,
                id: faker.string.uuid(),
                tenantId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            templates.unshift(newTemplate);
            return newTemplate;
        }
    },
    deleteTemplate: async (tenantId: string, templateId: string): Promise<void> => {
        await delay(500);
        const initialLength = templates.length;
        templates = templates.filter(t => !(t.id === templateId && t.tenantId === tenantId));
        if (templates.length === initialLength) {
            throw new Error('Template not found');
        }
    },
    getUsersForTenant: async (tenantId: string): Promise<User[]> => {
        await delay(600);
        return users.filter(u => u.tenantId === tenantId && u.role !== UserRole.SUPERADMIN);
    },
    inviteUser: async (tenantId: string, email: string, role: UserRole, adminUser: User): Promise<User> => {
        await delay(800);
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.tenantId === tenantId)) {
            throw new Error('User with this email already exists in this tenant.');
        }

        const newUser: User = {
            id: `user_${faker.string.uuid()}`,
            email,
            name: faker.person.fullName(),
            role,
            isActive: true, // In a real app, this would be false until they accept
            isVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tenantId,
        };
        users.push(newUser);

        const log: AuditLog = {
            id: faker.string.uuid(),
            userId: adminUser.id,
            userEmail: adminUser.email,
            tenantId,
            action: 'team.invite_user',
            metadata: { invitedEmail: email, role },
            createdAt: new Date().toISOString()
        };
        auditLogs.unshift(log);

        return newUser;
    },
    deleteUser: async (tenantId: string, userId: string, adminUser: User): Promise<void> => {
        await delay(500);
        const userIndex = users.findIndex(u => u.id === userId && u.tenantId === tenantId);
        if (userIndex === -1) {
            throw new Error('User not found.');
        }
        const deletedUserEmail = users[userIndex].email;
        
        users.splice(userIndex, 1);
        
        const log: AuditLog = {
            id: faker.string.uuid(),
            userId: adminUser.id,
            userEmail: adminUser.email,
            tenantId,
            action: 'team.delete_user',
            metadata: { deletedUserEmail },
            createdAt: new Date().toISOString()
        };
        auditLogs.unshift(log);
    },
};