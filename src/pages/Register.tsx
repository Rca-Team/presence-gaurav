
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import PageLayout from '@/components/layouts/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Webcam } from '@/components/ui/webcam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { registerFace } from '@/services/FaceRecognitionService';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const { toast } = useToast();
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    employeeId: '',
    department: '',
    position: '',
    year: '',
    major: '',
    standing: '',
    startingYear: '',
  });
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCaptureImage = async (imageData: string) => {
    try {
      console.log('Capturing face image');
      
      // Send image to backend for face embedding extraction
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      setFaceImage(imageData);
      setFaceCaptured(true);
      
      toast({
        title: "Face Captured",
        description: "Your face has been successfully captured.",
      });
      console.log('Face captured successfully');
    } catch (error) {
      console.error('Error capturing face:', error);
      toast({
        title: "Capture Error",
        description: "An error occurred while capturing your face. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!faceCaptured || !faceImage) {
      toast({
        title: "Missing face image",
        description: "Please capture your face before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting registration data');
      
      // Generate a proper UUID for the user
      const userId = uuidv4();
      
      console.log('Using UUID for registration:', userId);
      
      // Convert the base64 image to a blob
      const response = await fetch(faceImage);
      const imageBlob = await response.blob();
      
      // Send image to backend to get face embedding
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke(
        'face-recognition-arcface',
        {
          body: {
            imageData: faceImage,
            faces: [{ id: 'registration', boundingBox: { originX: 0, originY: 0, width: 100, height: 100 } }]
          }
        }
      );

      if (embeddingError || !embeddingData?.results?.[0]?.embedding) {
        throw new Error('Failed to extract face embedding');
      }

      const faceEmbedding = new Float32Array(embeddingData.results[0].embedding);
      
      // Register face with our service including parent contact info
      const registrationData = await registerFace(
        imageBlob,
        formData.name,
        formData.employeeId,
        formData.department,
        formData.position || '',
        userId,
        faceEmbedding,
        {
          phone: formData.phone,
          parent_name: formData.parentName,
          parent_email: formData.parentEmail,
          parent_phone: formData.parentPhone
        }
      );
      
      if (registrationData) {
        toast({
          title: "Registration Successful",
          description: "Your face has been registered for attendance",
        });
        console.log('Registration completed successfully');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          parentName: '',
          parentEmail: '',
          parentPhone: '',
          employeeId: '',
          department: '',
          position: '',
          year: '',
          major: '',
          standing: '',
          startingYear: '',
        });
        setFaceImage(null);
        setFaceCaptured(false);
        setRegistrationStep(1);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error('Error registering face:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering your face. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Register Your Face"
        description="Complete the form and capture your face to register for facial recognition attendance"
        className="animate-slide-in-down"
      />
      
      <div className="max-w-3xl mx-auto">
        <Card className="p-6 mb-8 animate-slide-in-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Registration Steps</h3>
            <span className="text-sm text-muted-foreground">Step {registrationStep} of 2</span>
          </div>
          
          <div className="relative">
            <div className="flex">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  registrationStep >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {registrationStep > 1 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    "1"
                  )}
                </div>
                <span className="text-sm font-medium mt-2">Personal Info</span>
              </div>
              
              <div className="flex-1 mx-4 mt-5">
                <div className={`h-1 ${
                  registrationStep > 1 ? "bg-primary" : "bg-muted"
                }`}></div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  registrationStep >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {registrationStep > 2 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    "2"
                  )}
                </div>
                <span className="text-sm font-medium mt-2">Face Capture</span>
              </div>
            </div>
          </div>
        </Card>
        
        <form onSubmit={handleSubmit}>
          {registrationStep === 1 ? (
            <Card className="p-6 animate-slide-in-up">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent/Guardian Name</Label>
                    <Input
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      placeholder="Parent Name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Parent Email</Label>
                    <Input
                      id="parentEmail"
                      name="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={handleInputChange}
                      placeholder="parent@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Parent Phone Number</Label>
                    <Input
                      id="parentPhone"
                      name="parentPhone"
                      type="tel"
                      value={formData.parentPhone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Student ID</Label>
                    <Input
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      placeholder="EMP-12345"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={formData.department} onValueChange={(value) => handleSelectChange('department', value)} required>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="Software Engineer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="major">Major/Class</Label>
                    <Input
                      id="major"
                      name="major"
                      value={formData.major}
                      onChange={handleInputChange}
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="standing">Standing</Label>
                    <Select value={formData.standing} onValueChange={(value) => handleSelectChange('standing', value)}>
                      <SelectTrigger id="standing">
                        <SelectValue placeholder="Select standing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid-level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startingYear">Starting Year</Label>
                    <Input
                      id="startingYear"
                      name="startingYear"
                      value={formData.startingYear}
                      onChange={handleInputChange}
                      placeholder="2020"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (formData.name && formData.email && formData.employeeId && formData.department && formData.parentName && formData.parentEmail && formData.parentPhone) {
                        setRegistrationStep(2);
                      } else {
                        toast({
                          title: "Incomplete information",
                          description: "Please fill in all required fields including parent contact information",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-6 animate-slide-in-up">
              <Card className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Capture Your Face</h3>
                  <p className="text-muted-foreground">
                    Please look directly at the camera and ensure your face is clearly visible.
                  </p>
                  
                  <div className="flex flex-col items-center">
                    <Webcam
                      ref={webcamRef}
                      onCapture={handleCaptureImage}
                      className="max-w-md w-full"
                      overlayClassName={faceCaptured ? "border-green-500" : ""}
                    />
                    
                    {faceCaptured ? (
                        <div className="mt-4 text-center">
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-500 text-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4 mr-1"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            Face captured successfully
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            You can recapture if you're not satisfied with the current image
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 text-center">
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 text-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4 mr-1"
                            >
                              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            No face captured yet
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Click the capture button when you're ready
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </Card>
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRegistrationStep(1)}
                >
                  Back
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !faceCaptured}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-r-transparent animate-spin"></span>
                      Processing...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </PageLayout>
  );
};

export default Register;
