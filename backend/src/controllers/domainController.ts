import { Request, Response } from 'express';
import { Domain, UnifiedDomain } from '../models/unifiedDomainModel.js';
import { generateDKIMKeys, generateDKIMDNSRecord } from '../services/dkimService.js';
import { dnsService } from '../services/dnsService.js';
import axios from 'axios';
import EmailAccount from '../models/EmailAccount.js';

export const addEmailToDomain = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const domainId = req.params.id;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const domain = await UnifiedDomain.findOne({
      _id: domainId,
      userId: req.user.id,
    });

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" });
    }

    // 1️⃣ Create EmailAccount first
    const newEmailAccount = await EmailAccount.create({
      userId: req.user.id,
      email,
      provider: "domain",        // NEW provider type
      isVerified: false,
      isPrimary: false,
      smtp: {},
      imap: {},
    });

    // 2️⃣ Ensure domain.emails is initialized and push EmailAccount reference into domain
    if (!Array.isArray((domain as any).emails)) {
      (domain as any).emails = [];
    }
    (domain as any).emails.push(newEmailAccount._id);

    await domain.save();

    return res.status(200).json({
      message: "Email added to domain successfully",
      domain,
    });

  } catch (error) {
    console.error("Error adding email to domain:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const createDomain = async (req: Request, res: Response) => {
  try {
    console.log('createDomain', req.user);
    const { domain_name, dkim_selector = 'email' } = req.body;

    if (!domain_name) {
      return res.status(400).json({ message: 'Domain name is required' });
    }

    // Fetch PMTA server IP
    const pmtaBaseUrl = process.env.PMTA_SERVICE_BASE_URL || 'http://107.175.67.25:3000';
    let pmtaServerIp: string;
    
    try {
      const ipResponse = await axios.get(`${pmtaBaseUrl}/get-ip`);
      if (ipResponse.data?.status === 'success' && ipResponse.data?.ip) {
        pmtaServerIp = ipResponse.data.ip;
      } else {
        throw new Error('Invalid response from PMTA service');
      }
    } catch (error: any) {
      console.error('Error fetching PMTA server IP:', error.message);
      return res.status(500).json({ 
        message: 'Failed to fetch PMTA server IP', 
        error: error.message 
      });
    }

    // Generate DKIM keys
    const { publicKey, privateKey } = await generateDKIMKeys(dkim_selector, domain_name);

    // Store DKIM private key in PMTA server
    try {
      await axios.post(`${pmtaBaseUrl}/update-dkim`, {
        domain: domain_name,
        dkim_value: privateKey
      });
      console.log(`DKIM private key stored in PMTA server for domain: ${domain_name}`);
    } catch (error: any) {
      console.error('Error storing DKIM private key in PMTA server:', error.message);
      // Continue even if this fails, as the domain can still be created
    }

    // Remove PEM headers and footers from public key
    const cleanPublicKey = publicKey
      .replace(/-----BEGIN RSA PUBLIC KEY-----/g, "")
      .replace(/-----END RSA PUBLIC KEY-----/g, "")
      .replace(/-----BEGIN PUBLIC KEY-----/g, "")
      .replace(/-----END PUBLIC KEY-----/g, "")
      .replace(/\n/g, "")
      .trim();

    // Generate SPF record using PMTA server IP
    const spfRecord = `v=spf1 ip4:${pmtaServerIp} ~all`;

    // Generate DMARC record
    const dmarcRecord = `v=DMARC1; p=none; rua=mailto:dmarc@${domain_name}; ruf=mailto:dmarc@${domain_name}; fo=1`;

    // Create domain with all DNS records
    const domainData = {
      domain: domain_name, // Also set domain field for unified model
      domain_name,
      dkim_selector,
      dkim_public_key: cleanPublicKey, // Store cleaned public key without PEM headers
      dkim_private_key: privateKey,
      spf_record: spfRecord,
      dmarc_record: dmarcRecord,
      userId: req.user?.id,
      verified: false,
      verificationStatus: 'pending' as const, // Use verificationStatus for unified model
      domainType: 'verified' as const, // Set domain type
    };

    const domain = new Domain(domainData);
    await domain.save();

    // Generate DNS record details for response
    const dkimRecordName = `${dkim_selector}._domainkey`;
    const dkimRecordValue = generateDKIMDNSRecord(publicKey);

    // Return domain with DNS records information
    res.status(201).json({
      ...domain.toObject(),
      dnsRecords: {
        dkim: {
          type: 'TXT',
          name: dkimRecordName,
          value: dkimRecordValue,
          host: `${dkimRecordName}.${domain_name}`,
          instructions: `Add this TXT record to your DNS: ${dkimRecordName}.${domain_name} with value: ${dkimRecordValue}`,
        },
        spf: {
          type: 'TXT',
          name: '@',
          value: spfRecord,
          host: domain_name,
          instructions: `Add this TXT record to your DNS: @ (or root) ${domain_name} with value: ${spfRecord}`,
        },
        dmarc: {
          type: 'TXT',
          name: '_dmarc',
          value: dmarcRecord,
          host: `_dmarc.${domain_name}`,
          instructions: `Add this TXT record to your DNS: _dmarc.${domain_name} with value: ${dmarcRecord}`,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDomains = async (req: Request, res: Response) => {
  try {
    const domains = await UnifiedDomain.find({ userId: req.user.id });
    if (!domains) {
      res.status(404).json({ message: 'Domains not found' });
      return;
    }
    res.status(200).json(domains);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDomainById = async (req: Request, res: Response) => {
  try {
    const domain = await UnifiedDomain.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!domain) {
      res.status(404).json({ message: 'Domain not found' });
      return 
    }

    res.json(domain);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDomain = async (req: Request, res: Response) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['dkim_selector', 'status', 'verificationStatus'];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      res.status(400).json({ error: 'Invalid updates!' });
      return 
    }

    // Map status to verificationStatus if status is provided
    const updateData: any = { ...req.body };
    if (updateData.status && !updateData.verificationStatus) {
      updateData.verificationStatus = updateData.status;
      delete updateData.status;
    }

    const domain = await UnifiedDomain.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!domain) {
      res.status(404).json({ message: 'Domain not found' });
      return 
    }

    res.json(domain);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDomain = async (req: Request, res: Response) => {
  try {
    const domain = await UnifiedDomain.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!domain) {
      res.status(404).json({ message: 'Domain not found' });
      return 
    }

    res.json({ message: 'Domain deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyDomain = async (req: Request, res: Response) => {
  try {
    const domain = await UnifiedDomain.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!domain) {
      res.status(404).json({ message: 'Domain not found' });
      return;
    }

    // Verify all DNS records
    const verificationResults = {
      dkim: await dnsService.verifyDKIMRecord(
        domain.domain_name || '',
        domain.dkim_selector || '',
        domain.dkim_public_key || ''
      ),
      spf: await dnsService.verifySPFRecord(
        domain.domain_name || '',
        domain.spf_record || ''
      ),
      dmarc: await dnsService.verifyDMARCRecord(
        domain.domain_name || '',
        domain.dmarc_record || ''
      ),
    };
console.log(verificationResults);

    // Check if all records are verified
    const allVerified =
      verificationResults.dkim.verified &&
      verificationResults.spf.verified &&
      verificationResults.dmarc.verified;

    // Update domain status based on verification results
    domain.verified = allVerified;
    domain.verificationStatus = allVerified ? 'verified' : 'failed';
    domain.last_verified_at = new Date();
    await domain.save();

    res.json({
      message: allVerified
        ? 'All DNS records verified successfully'
        : 'Some DNS records failed verification',
      verified: allVerified,
      domain,
      verificationResults,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
