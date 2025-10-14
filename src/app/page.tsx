
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Landmark, Loader2 } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      router.push('/dashboard');
    }
  }, [auth.currentUser, router]);

  const handleLogin = async () => {
    setIsPending(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro de Login',
        description: 'Credenciais inválidas. Por favor, verifique seu email e senha.',
      });
    } finally {
      setIsPending(false);
    }
  };

  const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/weak-password':
            return 'A senha deve ter pelo menos 6 caracteres.';
        case 'auth/email-already-in-use':
            return 'Este email já está em uso por outra conta.';
        case 'auth/invalid-email':
            return 'O formato do email fornecido é inválido.';
        default:
            return 'Não foi possível criar a conta. Tente novamente.';
    }
  }

  const handleSignUp = async () => {
    setIsPending(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;

      await updateProfile(user, { displayName: signupName });
      
      const userProfile = {
        id: user.uid,
        name: signupName,
        email: user.email,
      };
      
      if (firestore) {
        await setDoc(doc(firestore, 'users', user.uid), userProfile);
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro no Cadastro',
        description: getFriendlyErrorMessage(error.code),
      });
    } finally {
      setIsPending(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Tabs defaultValue="login" className="w-full max-w-sm">
            <Card>
                <CardHeader>
                    <div className="flex justify-center mb-2">
                        <Landmark className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline text-center">Bem-vindo ao Patrimonio</CardTitle>
                    <CardDescription className="text-center">
                       Selecione a aba para entrar ou se cadastrar.
                    </CardDescription>
                     <TabsList className="grid w-full grid-cols-2 mt-4">
                        <TabsTrigger value="login">Entrar</TabsTrigger>
                        <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent>
                    <TabsContent value="login">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    required
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="login-password">Senha</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    required
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <Button onClick={handleLogin} className="w-full" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Entrar
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="signup">
                       <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="signup-name">Nome</Label>
                                <Input 
                                    id="signup-name" 
                                    placeholder="Seu Nome" 
                                    required 
                                    value={signupName}
                                    onChange={(e) => setSignupName(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="signup-email">Email</Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    required
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="signup-password">Senha</Label>
                                <Input 
                                    id="signup-password" 
                                    type="password" 
                                    required 
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <Button onClick={handleSignUp} className="w-full" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Cadastrar
                            </Button>
                        </div>
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    </div>
  );
}
