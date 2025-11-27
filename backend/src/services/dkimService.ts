// src/services/dkimService.ts
import forge from "node-forge";
import { Domain, IDomain } from "../models/unifiedDomainModel.js";
import mongoose from "mongoose";

export const generateDKIMKeys = async (selector: string, domain: string) => {
  const keyPair = forge.pki.rsa.generateKeyPair(1024);
  const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);
  const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);
  console.log('publicKey', publicKey);
  console.log('privateKey', privateKey);
  return { selector, domain, publicKey, privateKey };
};

/** ✅ Save DKIM keys to MongoDB */
export const saveDKIMKeys = async (
  domain_id: string | mongoose.Types.ObjectId,
  publicKey: string,
  privateKey: string,
  selector?: string
): Promise<IDomain | null> => {
  const updatedDomain = await Domain.findByIdAndUpdate(
    domain_id,
    {
      dkim_public_key: publicKey,
      dkim_private_key: privateKey,
      ...(selector ? { dkim_selector: selector } : {}),
    },
    { new: true } // return updated document
  );
  return updatedDomain;
};

/** ✅ Generate DKIM DNS TXT record string */
export const generateDKIMDNSRecord = (publicKey: string) => {
  // Remove PEM headers and footers (handles both RSA and standard formats)
  const pubKeyClean = publicKey
    .replace(/-----BEGIN RSA PUBLIC KEY-----/g, "")
    .replace(/-----END RSA PUBLIC KEY-----/g, "")
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\n/g, "")
    .trim();

  return `v=DKIM1; k=rsa; p=${pubKeyClean}`;
};

/** ✅ Verify DKIM setup (placeholder: can use dns.promises) */
export const verifyDKIM = async (domain: string, selector: string): Promise<boolean> => {
  // Example: implement DNS TXT lookup using dns.promises.resolveTxt(domain)
  return true;
};

/** ✅ Sign email headers with DKIM for Nodemailer */
export const signEmailWithDKIM = (
  emailOptions: any,
  privateKey: string,
  selector: string,
  domain: string
) => {
  return {
    ...emailOptions,
    dkim: {
      domainName: domain,
      keySelector: selector,
      privateKey,
    },
  };
};
